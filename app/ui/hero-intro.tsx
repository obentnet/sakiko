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
  noteFinalIcon,
  noteFinalLabel,
  smoothEase,
} from "./home-transition-constants";
const avatarSize = 152;
const cardHeight = 660;
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
const linkCards = [
  { label: "博文", icon: "/home.svg", href: "/blog" },
  { label: "随笔", icon: "/note.svg", href: "/note" },
  { label: "朋友", icon: "/friends.svg", href: "#" },
];

const socialCards = [
  { label: "bilibili", icon: "/social/bilibili.svg", href: "#" },
  { label: "github", icon: "/social/github.svg", href: "#" },
  { label: "twitter", icon: "/social/twitter.svg", href: "#" },
  { label: "donate", icon: "/social/donate.svg", href: "#" },
];

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

type TransitionCardKind = "blog" | "note";

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

export default function HeroIntro({
  returningFromBlog = false,
}: {
  returningFromBlog?: boolean;
}) {
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const backgroundCardRef = useRef<HTMLDivElement | null>(null);
  const blogCardRef = useRef<HTMLButtonElement | null>(null);
  const blogLabelRef = useRef<HTMLSpanElement | null>(null);
  const blogIconRef = useRef<HTMLSpanElement | null>(null);
  const noteCardRef = useRef<HTMLButtonElement | null>(null);
  const noteLabelRef = useRef<HTMLSpanElement | null>(null);
  const noteIconRef = useRef<HTMLSpanElement | null>(null);
  const pushedRef = useRef(false);
  const [cardStage, setCardStage] = useState<CardTransitionStage>("idle");
  const [cardTransition, setCardTransition] =
    useState<CardTransitionSnapshot | null>(null);

  useEffect(() => {
    router.prefetch("/blog");
    router.prefetch("/note");
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

  const startCardTransition = (kind: TransitionCardKind) => {
    const isBlog = kind === "blog";
    const cardRef = isBlog ? blogCardRef.current : noteCardRef.current;
    const labelRef = isBlog ? blogLabelRef.current : noteLabelRef.current;
    const iconRef = isBlog ? blogIconRef.current : noteIconRef.current;

    if (cardTransition || !frameRef.current || !backgroundCardRef.current || !cardRef || !labelRef || !iconRef) {
      return;
    }

    const frameRect = frameRef.current.getBoundingClientRect();
    const backgroundRect = backgroundCardRef.current.getBoundingClientRect();
    const cardRect = cardRef.getBoundingClientRect();
    const labelRect = labelRef.getBoundingClientRect();
    const iconRect = iconRef.getBoundingClientRect();

    const snapshot = {
      kind,
      labelText: isBlog ? "博文" : "随笔",
      iconPath: isBlog ? "/home.svg" : "/note.svg",
      route: isBlog ? "/blog" : "/note",
      source: {
        left: cardRect.left - frameRect.left,
        top: cardRect.top - frameRect.top,
        width: cardRect.width,
        height: cardRect.height,
      },
      target: {
        left: backgroundRect.left - frameRect.left,
        top: backgroundRect.top - frameRect.top,
        width: backgroundRect.width,
        height: backgroundRect.height,
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
      finalLabel: isBlog ? blogFinalLabel : noteFinalLabel,
      finalIcon: isBlog ? blogFinalIcon : noteFinalIcon,
    } satisfies CardTransitionSnapshot;

    pushedRef.current = false;
    setCardTransition(snapshot);
    setCardStage("move");
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: "var(--theme-page-bg)" }}
    >
      <BackgroundOrnaments />
      <LayoutGroup>
        <div ref={frameRef} className="relative h-[820px] w-full max-w-[720px]">
          <motion.div
            ref={backgroundCardRef}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 z-0 w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px]"
            initial={
              returningFromBlog
                ? { scale: 1, opacity: 1 }
                : { scale: 0.18, opacity: 0 }
            }
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: returningFromBlog ? 0 : cardDelay,
              duration: returningFromBlog ? 0 : cardDuration,
              ease: smoothEase,
            }}
            style={{
              height: cardHeight,
              transformOrigin: "center center",
              backgroundColor: "var(--theme-primary)",
              boxShadow: "0 30px 90px var(--theme-primary-shadow)",
            }}
          />

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={
              returningFromBlog
                ? { y: -avatarLift + 20, scale: 0.72, opacity: 0 }
                : { y: 0, scale: 1, opacity: 1 }
            }
            animate={{ y: -avatarLift, scale: 1, opacity: 1 }}
            transition={{
              delay: returningFromBlog ? 0 : avatarDelay,
              duration: returningFromBlog ? returnAvatarDuration : avatarDuration,
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: returningFromBlog ? returnTitleDelay : titleDelay,
            duration: 0.4,
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: returningFromBlog ? returnSubtitleDelay : subtitleDelay,
            duration: 0.42,
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
            className="absolute left-1/2 z-10 flex w-full max-w-[560px] -translate-x-1/2 gap-4"
            style={{
              top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 176}px)`,
            }}
          >
            {linkCards.map((item, index) => {
              if (index === 0 || index === 1) {
                const kind: TransitionCardKind = index === 0 ? "blog" : "note";
                const isActive = cardTransition?.kind === kind;
                const cardRef = kind === "blog" ? blogCardRef : noteCardRef;
                const labelRef = kind === "blog" ? blogLabelRef : noteLabelRef;
                const iconRef = kind === "blog" ? blogIconRef : noteIconRef;

                if (isActive) {
                  return <div key={item.label} className="h-[112px] flex-1" />;
                }

                return (
                  <motion.button
                    key={item.label}
                    ref={cardRef}
                    layoutId={`${kind}-card-shell`}
                    type="button"
                    onClick={() => startCardTransition(kind)}
                    className="relative flex h-[112px] flex-1 cursor-pointer items-end overflow-hidden rounded-[24px] px-5 pb-5 text-[24px] font-bold tracking-[-0.03em]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover="hover"
                    transition={{
                      delay:
                        (returningFromBlog ? returnLinksDelay : linksDelay) +
                        index * 0.08,
                      duration: 0.45,
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
                      className="absolute right-3 top-3 h-[72px] w-[72px] opacity-85"
                      variants={linkIconVariants}
                      style={{
                        backgroundColor: "var(--theme-panel-icon)",
                        ...getMaskStyle(item.icon),
                      }}
                    />
                  </motion.button>
                );
              }

              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="relative flex h-[112px] flex-1 items-end overflow-hidden rounded-[24px] px-5 pb-5 text-[24px] font-bold tracking-[-0.03em]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover="hover"
                  transition={{
                    delay:
                      (returningFromBlog ? returnLinksDelay : linksDelay) +
                      index * 0.08,
                    duration: 0.45,
                    ease: smoothEase,
                  }}
                  style={{
                    backgroundColor: "var(--theme-panel-bg)",
                    color: "var(--theme-panel-text)",
                  }}
                >
                  <motion.span
                    className="relative z-10 origin-left"
                    variants={linkLabelVariants}
                  >
                    {item.label}
                  </motion.span>
                  <motion.span
                    aria-hidden="true"
                    className="absolute right-3 top-3 h-[72px] w-[72px] opacity-85"
                    variants={linkIconVariants}
                    style={{
                      backgroundColor: "var(--theme-panel-icon)",
                      ...getMaskStyle(item.icon),
                    }}
                  />
                </motion.a>
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay:
                  (returningFromBlog ? returnSocialDelay : socialDelay) +
                  index * 0.08,
                duration: 0.45,
                ease: smoothEase,
              }}
            >
                <motion.a
                  href={item.href}
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
