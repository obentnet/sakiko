'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundOrnaments from "./background-ornaments";
import {
  blogExpandDuration,
  blogFinalIcon,
  blogFinalLabel,
  blogMoveDuration,
  blogSettleDuration,
  cardHeight,
  friendFinalIcon,
  friendFinalLabel,
  friendFrameWidth,
  friendPanelWidth,
  noteFinalIcon,
  noteFinalLabel,
  smoothEase,
} from "./home-transition-constants";

const avatarSize = 152;
const cardInnerTopPadding = 40;
const avatarLift = cardHeight / 2 - avatarSize / 2 - cardInnerTopPadding;
const cardDelay = 0.75;
const cardDuration = 0.9;
const avatarDuration = 0.85;
const avatarDelay = cardDelay + cardDuration + 0.1;
const titleDelay = avatarDelay + avatarDuration;
const subtitleDelay = titleDelay + 0.15;
const linksDelay = subtitleDelay + 0.15;
const socialDelay = linksDelay + 0.3;
const returnAvatarDuration = 0.42;
const returnTitleDelay = 0.44;
const returnSubtitleDelay = 0.58;
const returnLinksDelay = 0.86;
const returnSocialDelay = 1.12;
const friendReturnOffset = -300;
const friendReturnDuration = 0.62;
const autoOpenDelay = friendReturnDuration + 0.04;

const linkLabelVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.12,
    transition: { duration: 0.22, ease: smoothEase },
  },
};

const linkIconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 0.84,
    rotate: [0, -10, 10, -8, 8, 0],
    transition: {
      scale: { duration: 0.2, ease: smoothEase },
      rotate: { duration: 0.45, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    },
  },
};

const socialButtonVariants = {
  rest: {
    borderColor: "rgba(255, 255, 255, 0)",
    scale: 1,
  },
  hover: {
    borderColor: "var(--theme-panel-text)",
    scale: 1.04,
    transition: { duration: 0.2, ease: smoothEase },
  },
};

const socialLabelVariants = {
  rest: { opacity: 0, y: 6 },
  hover: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: smoothEase },
  },
};

type CardTransitionStage = "idle" | "move" | "expand" | "settle";
type TransitionCardKind = "blog" | "note" | "friend";

type SocialLinks = {
  bilibili: string;
  github: string;
  twitter: string;
  donate: string;
};

type CardTransitionSnapshot = {
  kind: TransitionCardKind;
  labelText: string;
  iconPath: string;
  route: string;
  source: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  target: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  label: {
    left: number;
    top: number;
  };
  icon: {
    left: number;
    top: number;
    size: number;
  };
  finalLabel: {
    left: number;
    top: number;
  };
  finalIcon: {
    left: number;
    top: number;
    size: number;
  };
};

function getMaskStyle(icon: string) {
  return {
    maskImage: `url(${icon})`,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskImage: `url(${icon})`,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
  } as const;
}

function getCardConfig(kind: TransitionCardKind) {
  switch (kind) {
    case "blog":
      return {
        labelText: "博文",
        iconPath: "/home.svg",
        route: "/blog",
        finalLabel: blogFinalLabel,
        finalIcon: blogFinalIcon,
      };
    case "note":
      return {
        labelText: "随笔",
        iconPath: "/note.svg",
        route: "/note",
        finalLabel: noteFinalLabel,
        finalIcon: noteFinalIcon,
      };
    case "friend":
      return {
        labelText: "朋友",
        iconPath: "/friends.svg",
        route: "/friend",
        finalLabel: friendFinalLabel,
        finalIcon: friendFinalIcon,
      };
  }
}

export default function HeroIntro({
  returningFromDetail = false,
  returningFromFriend = false,
  autoOpenKind,
  socialLinks,
}: {
  returningFromDetail?: boolean;
  returningFromFriend?: boolean;
  autoOpenKind?: Exclude<TransitionCardKind, "friend">;
  socialLinks: SocialLinks;
}) {
  const isStaticFriendReturn = returningFromDetail && returningFromFriend;
  const linkCards = [
    { kind: "blog" as const, label: "博文", icon: "/home.svg" },
    { kind: "note" as const, label: "随笔", icon: "/note.svg" },
    { kind: "friend" as const, label: "朋友", icon: "/friends.svg" },
  ];

  const socialCards = [
    { label: "bilibili", icon: "/social/bilibili.svg", href: socialLinks.bilibili },
    { label: "github", icon: "/social/github.svg", href: socialLinks.github },
    { label: "twitter", icon: "/social/twitter.svg", href: socialLinks.twitter },
    { label: "donate", icon: "/social/donate.svg", href: socialLinks.donate },
  ];

  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const backgroundCardRef = useRef<HTMLDivElement | null>(null);
  const friendTargetRef = useRef<HTMLDivElement | null>(null);
  const blogCardRef = useRef<HTMLButtonElement | null>(null);
  const blogLabelRef = useRef<HTMLSpanElement | null>(null);
  const blogIconRef = useRef<HTMLSpanElement | null>(null);
  const noteCardRef = useRef<HTMLButtonElement | null>(null);
  const noteLabelRef = useRef<HTMLSpanElement | null>(null);
  const noteIconRef = useRef<HTMLSpanElement | null>(null);
  const friendCardRef = useRef<HTMLButtonElement | null>(null);
  const friendLabelRef = useRef<HTMLSpanElement | null>(null);
  const friendIconRef = useRef<HTMLSpanElement | null>(null);
  const pushedRef = useRef(false);
  const autoOpenTriggeredRef = useRef(false);
  const [cardStage, setCardStage] = useState<CardTransitionStage>("idle");
  const [cardTransition, setCardTransition] =
    useState<CardTransitionSnapshot | null>(null);

  useEffect(() => {
    router.prefetch("/blog");
    router.prefetch("/note");
    router.prefetch("/friend");
  }, [router]);

  useEffect(() => {
    if (!autoOpenKind) {
      return;
    }

    router.prefetch(autoOpenKind === "blog" ? "/blog" : "/note");
  }, [router]);

  const finishCardTransition = useCallback(() => {
    if (pushedRef.current || !cardTransition) {
      return;
    }

    pushedRef.current = true;
    startTransition(() => {
      router.push(cardTransition.route, { scroll: false });
    });
  }, [cardTransition, router]);

  useEffect(() => {
    if (cardStage === "idle") {
      return;
    }

    if (cardStage === "move") {
      const timer = window.setTimeout(() => {
        setCardStage("expand");
      }, blogMoveDuration * 1000);

      return () => window.clearTimeout(timer);
    }

    if (cardStage === "expand") {
      const timer = window.setTimeout(() => {
        setCardStage("settle");
      }, blogExpandDuration * 1000);

      return () => window.clearTimeout(timer);
    }

    if (cardStage === "settle") {
      const timer = window.setTimeout(() => {
        finishCardTransition();
      }, blogSettleDuration * 1000);

      return () => window.clearTimeout(timer);
    }
  }, [cardStage, finishCardTransition]);

  const getCardElements = (kind: TransitionCardKind) => {
    switch (kind) {
      case "blog":
        return {
          cardRef: blogCardRef.current,
          labelRef: blogLabelRef.current,
          iconRef: blogIconRef.current,
        };
      case "note":
        return {
          cardRef: noteCardRef.current,
          labelRef: noteLabelRef.current,
          iconRef: noteIconRef.current,
        };
      case "friend":
        return {
          cardRef: friendCardRef.current,
          labelRef: friendLabelRef.current,
          iconRef: friendIconRef.current,
        };
    }
  };

  const getCardRefHandles = (kind: TransitionCardKind) => {
    switch (kind) {
      case "blog":
        return {
          cardRef: blogCardRef,
          labelRef: blogLabelRef,
          iconRef: blogIconRef,
        };
      case "note":
        return {
          cardRef: noteCardRef,
          labelRef: noteLabelRef,
          iconRef: noteIconRef,
        };
      case "friend":
        return {
          cardRef: friendCardRef,
          labelRef: friendLabelRef,
          iconRef: friendIconRef,
        };
    }
  };

  const startCardTransition = (kind: TransitionCardKind) => {
    const { cardRef, labelRef, iconRef } = getCardElements(kind);
    const targetElement =
      kind === "friend" ? friendTargetRef.current : backgroundCardRef.current;
    const config = getCardConfig(kind);

    if (
      cardTransition ||
      !frameRef.current ||
      !targetElement ||
      !cardRef ||
      !labelRef ||
      !iconRef
    ) {
      return;
    }

    const frameRect = frameRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const cardRect = cardRef.getBoundingClientRect();
    const labelRect = labelRef.getBoundingClientRect();
    const iconRect = iconRef.getBoundingClientRect();

    const snapshot = {
      kind,
      labelText: config.labelText,
      iconPath: config.iconPath,
      route: config.route,
      source: {
        left: cardRect.left - frameRect.left,
        top: cardRect.top - frameRect.top,
        width: cardRect.width,
        height: cardRect.height,
      },
      target: {
        left: targetRect.left - frameRect.left,
        top: targetRect.top - frameRect.top,
        width: targetRect.width,
        height: targetRect.height,
      },
      label: {
        left: labelRect.left - cardRect.left,
        top: labelRect.top - cardRect.top,
      },
      icon: {
        left: iconRect.left - cardRect.left,
        top: iconRect.top - cardRect.top,
        size: iconRect.width,
      },
      finalLabel: config.finalLabel,
      finalIcon: config.finalIcon,
    } satisfies CardTransitionSnapshot;

    pushedRef.current = false;
    setCardTransition(snapshot);
    setCardStage("move");
  };

  useEffect(() => {
    if (!autoOpenKind || autoOpenTriggeredRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      autoOpenTriggeredRef.current = true;
      startCardTransition(autoOpenKind);
    }, autoOpenDelay * 1000);

    return () => window.clearTimeout(timer);
  }, [autoOpenKind]);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: "var(--theme-page-bg)" }}
    >
      <BackgroundOrnaments />
      <LayoutGroup>
        <div
          ref={frameRef}
          className="relative h-[820px] w-full max-w-[1120px]"
          style={{ maxWidth: friendFrameWidth }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{
              x: returningFromFriend ? friendReturnOffset : 0,
            }}
            animate={{ x: 0 }}
            transition={{
              delay: 0,
              duration: returningFromFriend ? friendReturnDuration : 0,
              ease: smoothEase,
            }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{
              x: returningFromFriend ? friendReturnOffset : 0,
            }}
            animate={{ x: 0 }}
            transition={{
              delay: 0,
              duration: returningFromFriend ? friendReturnDuration : 0,
              ease: smoothEase,
            }}
          >
            <motion.div
              ref={backgroundCardRef}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-0 w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px]"
              initial={
                returningFromDetail
                  ? { scale: 1, opacity: 1, x: 0 }
                  : { scale: 0.18, opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{
                delay: returningFromDetail ? 0 : cardDelay,
                duration: returningFromDetail
                  ? 0
                  : cardDuration,
                ease: smoothEase,
              }}
              style={{
                height: cardHeight,
                transformOrigin: "center center",
                backgroundColor: "var(--theme-primary)",
                boxShadow: "0 30px 90px var(--theme-primary-shadow)",
              }}
            />

            <div
              ref={friendTargetRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[660px] w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-0 min-[1200px]:left-auto min-[1200px]:right-0 min-[1200px]:translate-x-0"
              style={{ maxWidth: friendPanelWidth }}
            />

            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={
                  returningFromDetail
                    ? isStaticFriendReturn
                      ? { y: -avatarLift, scale: 1, opacity: 1, x: 0 }
                      : { y: -avatarLift + 20, scale: 0.72, opacity: 0, x: 0 }
                    : { y: 0, scale: 1, opacity: 1 }
                }
                animate={{ y: -avatarLift, scale: 1, opacity: 1, x: 0 }}
                transition={{
                  delay: returningFromDetail ? 0 : avatarDelay,
                  duration: returningFromDetail
                    ? isStaticFriendReturn
                      ? 0
                      : returnAvatarDuration
                    : avatarDuration,
                  ease: smoothEase,
                }}
              >
                <div
                  className="relative overflow-hidden rounded-full border-4 border-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
                  style={{ height: avatarSize, width: avatarSize }}
                >
                  <Image
                    src="/head.jpg"
                    alt="Avatar"
                    fill
                    sizes={`${avatarSize}px`}
                    preload
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              className="absolute left-1/2 z-10 flex -translate-x-1/2 items-end gap-2 text-center"
              initial={{
                opacity: isStaticFriendReturn ? 1 : 0,
                y: isStaticFriendReturn ? 0 : 10,
                x: 0,
              }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{
                delay: returningFromDetail
                  ? isStaticFriendReturn
                    ? 0
                    : returnTitleDelay
                  : titleDelay,
                duration: isStaticFriendReturn ? 0 : 0.4,
                ease: "easeOut",
              }}
              style={{
                top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 48}px)`,
                color: "var(--theme-primary-text)",
              }}
            >
              <span className="text-[34px] font-bold leading-none tracking-[-0.04em]">
                狱杰
              </span>
              <small className="pb-[2px] text-[18px] font-bold leading-none tracking-[-0.03em]">
                @uegee
              </small>
            </motion.div>

            <motion.p
              className="absolute left-1/2 z-10 w-full max-w-[520px] -translate-x-1/2 text-center text-[18px] font-bold leading-7 tracking-[-0.03em]"
              initial={{
                opacity: isStaticFriendReturn ? 1 : 0,
                y: isStaticFriendReturn ? 0 : 10,
                x: 0,
              }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{
                delay: returningFromDetail
                  ? isStaticFriendReturn
                    ? 0
                    : returnSubtitleDelay
                  : subtitleDelay,
                duration: isStaticFriendReturn ? 0 : 0.42,
                ease: "easeOut",
              }}
              style={{
                top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 96}px)`,
                color: "var(--theme-primary-text)",
              }}
            >
              曾几何时 稚嫩的小手也拥有了追越我们的坚强
            </motion.p>

            <div
              className="absolute left-1/2 z-10 flex w-full max-w-[560px] -translate-x-1/2 gap-2 sm:gap-4"
              style={{
                top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 176}px)`,
              }}
            >
              {linkCards.map((item, index) => {
                const isActive = cardTransition?.kind === item.kind;
                const { cardRef, labelRef, iconRef } = getCardRefHandles(item.kind);

                if (isActive) {
                  return (
                    <div
                      key={item.label}
                      className="h-[82px] flex-1 sm:h-[112px]"
                    />
                  );
                }

                return (
                  <motion.button
                    key={item.label}
                    ref={cardRef}
                    layoutId={`${item.kind}-card-shell`}
                    type="button"
                    onClick={() => startCardTransition(item.kind)}
                    className="relative flex h-[82px] flex-1 cursor-pointer items-end overflow-hidden rounded-[20px] px-3 pb-3 text-[18px] font-bold tracking-[-0.03em] sm:h-[112px] sm:rounded-[24px] sm:px-5 sm:pb-5 sm:text-[24px]"
                    initial={{
                      opacity: isStaticFriendReturn ? 1 : 0,
                      y: isStaticFriendReturn ? 0 : 20,
                      x: 0,
                    }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    whileHover="hover"
                    transition={{
                      delay:
                        ((returningFromDetail && !isStaticFriendReturn)
                          ? returnLinksDelay
                          : returningFromDetail
                            ? 0
                            : linksDelay) +
                        index * 0.08,
                      duration: isStaticFriendReturn ? 0 : 0.45,
                      ease: smoothEase,
                    }}
                    style={{
                      backgroundColor: "var(--theme-panel-bg)",
                      color: "var(--theme-panel-text)",
                    }}
                  >
                    <motion.span
                      ref={labelRef}
                      className="relative z-10 origin-left"
                      variants={linkLabelVariants}
                    >
                      {item.label}
                    </motion.span>
                  <motion.span
                    ref={iconRef}
                    aria-hidden="true"
                    className="absolute right-2 top-2 h-[44px] w-[44px] opacity-85 sm:right-3 sm:top-3 sm:h-[72px] sm:w-[72px]"
                    variants={linkIconVariants}
                    style={{
                      backgroundColor: "var(--theme-panel-icon)",
                        ...getMaskStyle(item.icon),
                      }}
                    />
                  </motion.button>
                );
              })}
            </div>

            <div
              className="absolute left-1/2 z-10 flex w-full max-w-[278px] -translate-x-1/2 justify-between"
              style={{
                bottom: `calc(50% - ${cardHeight / 2}px + 72px)`,
              }}
            >
              {socialCards.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex h-[64px] w-[62px] flex-col items-center"
                  initial={{
                    opacity: isStaticFriendReturn ? 1 : 0,
                    y: isStaticFriendReturn ? 0 : 24,
                    x: 0,
                  }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{
                    delay:
                      ((returningFromDetail && !isStaticFriendReturn)
                        ? returnSocialDelay
                        : returningFromDetail
                          ? 0
                          : socialDelay) +
                      index * 0.08,
                    duration: isStaticFriendReturn ? 0 : 0.45,
                    ease: smoothEase,
                  }}
                >
                <motion.a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-[41px] w-[41px] items-center justify-center rounded-full border-2"
                  initial="rest"
                  whileHover="hover"
                    animate="rest"
                    variants={socialButtonVariants}
                    style={{
                      backgroundColor: "var(--theme-panel-bg)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      style={{
                        backgroundColor: "var(--theme-panel-text)",
                        ...getMaskStyle(item.icon),
                      }}
                    />
                    <motion.span
                      className="absolute left-1/2 top-[48px] -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-[2px] text-[12px] font-bold tracking-[-0.03em]"
                      variants={socialLabelVariants}
                      style={{
                        backgroundColor: "var(--theme-panel-bg)",
                        color: "var(--theme-panel-text)",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  </motion.a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {cardTransition ? (
            <motion.div
              layoutId={`${cardTransition.kind}-card-shell`}
              className="absolute z-40 overflow-hidden"
              animate={{
                width:
                  cardStage === "move"
                    ? cardTransition.source.width
                    : cardTransition.target.width,
                height:
                  cardStage === "move"
                    ? cardTransition.source.height
                    : cardTransition.target.height,
                borderRadius: cardStage === "move" ? 24 : 44,
              }}
              style={{
                left: cardTransition.target.left,
                top: cardTransition.target.top,
                width: cardTransition.source.width,
                height: cardTransition.source.height,
                borderRadius: 24,
                backgroundColor: "var(--theme-panel-bg)",
                boxShadow: "0 30px 90px var(--theme-panel-shadow)",
              }}
              transition={{
                layout: { duration: blogMoveDuration, ease: smoothEase },
                width: { duration: blogExpandDuration, ease: smoothEase },
                height: { duration: blogExpandDuration, ease: smoothEase },
                borderRadius: { duration: blogExpandDuration, ease: smoothEase },
              }}
            >
              <motion.span
                className="absolute text-[24px] font-bold tracking-[-0.03em]"
                animate={{
                  left:
                    cardStage === "settle"
                      ? cardTransition.finalLabel.left
                      : cardTransition.label.left,
                  top:
                    cardStage === "settle"
                      ? cardTransition.finalLabel.top
                      : cardTransition.label.top,
                }}
                transition={{
                  duration: blogSettleDuration,
                  ease: smoothEase,
                }}
                style={{
                  left: cardTransition.label.left,
                  top: cardTransition.label.top,
                  color: "var(--theme-panel-text)",
                }}
              >
                {cardTransition.labelText}
              </motion.span>
              <motion.span
                aria-hidden="true"
                className="absolute opacity-85"
                animate={{
                  left:
                    cardStage === "settle"
                      ? cardTransition.finalIcon.left
                      : cardTransition.icon.left,
                  top:
                    cardStage === "settle"
                      ? cardTransition.finalIcon.top
                      : cardTransition.icon.top,
                  width:
                    cardStage === "settle"
                      ? cardTransition.finalIcon.size
                      : cardTransition.icon.size,
                  height:
                    cardStage === "settle"
                      ? cardTransition.finalIcon.size
                      : cardTransition.icon.size,
                }}
                transition={{
                  duration: blogSettleDuration,
                  ease: smoothEase,
                }}
                style={{
                  left: cardTransition.icon.left,
                  top: cardTransition.icon.top,
                  width: cardTransition.icon.size,
                  height: cardTransition.icon.size,
                  backgroundColor: "var(--theme-panel-icon)",
                  ...getMaskStyle(cardTransition.iconPath),
                }}
              />
            </motion.div>
          ) : null}
        </div>
      </LayoutGroup>
    </main>
  );
}
