'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  cardHeight,
  friendFinalIcon,
  friendFinalLabel,
  friendFrameWidth,
  friendPanelWidth,
  panelRadius,
  smoothEase,
} from "./home-transition-constants";

export type FriendItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  favicon: string | null;
  url: string;
  status: string;
  createTimeLabel: string;
};

type SocialLinks = {
  bilibili: string;
  github: string;
  twitter: string;
  donate: string;
};

type CloseTransitionSnapshot = {
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
  targetLabel: {
    left: number;
    top: number;
  };
  targetIcon: {
    left: number;
    top: number;
    size: number;
  };
};

const avatarSize = 152;
const cardInnerTopPadding = 40;
const avatarLift = cardHeight / 2 - avatarSize / 2 - cardInnerTopPadding;
const friendPanelHeight = 660;
const closeTransitionDuration = 0.58;
const makeSpaceDuration = 0.28;
const totalCloseDuration = makeSpaceDuration + closeTransitionDuration;
const backFillDuration = 0.42;
const leftPanelEnterOffset = 300;
const homeLinkRowWidth = 560;
const homeLinkGap = 16;
const homeLinkCardWidth = (homeLinkRowWidth - homeLinkGap * 2) / 3;
const homeLinkCenterOffset = (homeLinkRowWidth - (homeLinkCardWidth * 2 + homeLinkGap)) / 2;

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: smoothEase,
    },
  },
};

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

export default function FriendPageShell({
  friends,
  socialLinks,
}: {
  friends: FriendItem[];
  socialLinks: SocialLinks;
}) {
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const friendCardRef = useRef<HTMLAnchorElement | null>(null);
  const friendLabelRef = useRef<HTMLSpanElement | null>(null);
  const friendIconRef = useRef<HTMLSpanElement | null>(null);
  const nextRouteRef = useRef("/return/friend");
  const pushedRef = useRef(false);
  const [closeTransition, setCloseTransition] =
    useState<CloseTransitionSnapshot | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [closeMode, setCloseMode] = useState<"desktop" | "mobile" | null>(null);
  const [backRipple, setBackRipple] = useState({
    cx: friendPanelWidth - 42,
    cy: 39,
    radius: 18,
  });

  const finishBackTransition = useCallback(() => {
    if (pushedRef.current) {
      return;
    }

    pushedRef.current = true;
    startTransition(() => {
      router.push(nextRouteRef.current, { scroll: false });
    });
  }, [router]);

  useEffect(() => {
    router.prefetch("/return");
    router.prefetch("/return/friend");
    router.prefetch("/return/friend/blog");
    router.prefetch("/return/friend/note");
    router.prefetch("/blog");
    router.prefetch("/note");
  }, [router]);

  useEffect(() => {
    if (!isLeaving) {
      return;
    }

    const timer = window.setTimeout(() => {
      finishBackTransition();
    }, (closeMode === "mobile" ? backFillDuration : totalCloseDuration) * 1000);

    return () => window.clearTimeout(timer);
  }, [closeMode, finishBackTransition, isLeaving]);

  const startCloseTransition = (nextRoute = "/return/friend") => {
    const isDesktop = window.matchMedia("(min-width: 1200px)").matches;

    if (!isDesktop) {
      if (sectionRef.current && closeButtonRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const buttonRect = closeButtonRef.current.getBoundingClientRect();
        const cx = buttonRect.left - sectionRect.left + buttonRect.width / 2;
        const cy = buttonRect.top - sectionRect.top + buttonRect.height / 2;
        const radius = Math.hypot(
          Math.max(cx, sectionRect.width - cx),
          Math.max(cy, sectionRect.height - cy),
        );

        setBackRipple({ cx, cy, radius });
      }

      pushedRef.current = false;
      nextRouteRef.current = nextRoute === "/return/friend" ? "/return" : nextRoute;
      setCloseTransition(null);
      setCloseMode("mobile");
      setIsLeaving(true);
      return;
    }

    if (
      !frameRef.current ||
      !sectionRef.current ||
      !friendCardRef.current ||
      !friendLabelRef.current ||
      !friendIconRef.current
    ) {
      nextRouteRef.current = nextRoute;
      finishBackTransition();
      return;
    }

    const frameRect = frameRef.current.getBoundingClientRect();
    const panelRect = sectionRef.current.getBoundingClientRect();
    const cardRect = friendCardRef.current.getBoundingClientRect();
    const labelRect = friendLabelRef.current.getBoundingClientRect();
    const iconRect = friendIconRef.current.getBoundingClientRect();

    const snapshot = {
      source: {
        left: panelRect.left - frameRect.left,
        top: panelRect.top - frameRect.top,
        width: panelRect.width,
        height: panelRect.height,
      },
      target: {
        left: cardRect.left - frameRect.left,
        top: cardRect.top - frameRect.top,
        width: cardRect.width,
        height: cardRect.height,
      },
      label: {
        left: friendFinalLabel.left,
        top: friendFinalLabel.top,
      },
      icon: {
        left: friendFinalIcon.left,
        top: friendFinalIcon.top,
        size: friendFinalIcon.size,
      },
      targetLabel: {
        left: labelRect.left - cardRect.left,
        top: labelRect.top - cardRect.top,
      },
      targetIcon: {
        left: iconRect.left - cardRect.left,
        top: iconRect.top - cardRect.top,
        size: iconRect.width,
      },
    } satisfies CloseTransitionSnapshot;

    pushedRef.current = false;
    nextRouteRef.current = nextRoute;
    setCloseMode("desktop");
    setCloseTransition(snapshot);
    setIsLeaving(true);
  };

  const isDesktopClosing = isLeaving && closeMode === "desktop";
  const isMobileClosing = isLeaving && closeMode === "mobile";

  const linkCards = [
    { label: "博文", icon: "/home.svg", href: "/blog" },
    { label: "随笔", icon: "/note.svg", href: "/note" },
    { label: "朋友", icon: "/friends.svg", href: "/friend" },
  ];
  const visibleLinkCards = linkCards.filter((item) => item.label !== "朋友");

  const socialCards = [
    { label: "bilibili", icon: "/social/bilibili.svg", href: socialLinks.bilibili },
    { label: "github", icon: "/social/github.svg", href: socialLinks.github },
    { label: "twitter", icon: "/social/twitter.svg", href: socialLinks.twitter },
    { label: "donate", icon: "/social/donate.svg", href: socialLinks.donate },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div
        ref={frameRef}
        className="relative h-[820px] w-full max-w-[1280px]"
        style={{ maxWidth: friendFrameWidth }}
      >
        <motion.section
          className="absolute left-0 top-1/2 z-10 hidden h-[660px] w-full max-w-[680px] -translate-y-1/2 overflow-hidden min-[1200px]:block"
          initial={{ x: leftPanelEnterOffset }}
          animate={{ x: 0 }}
          transition={{
            duration: 0.62,
            ease: smoothEase,
          }}
          style={{
            borderRadius: panelRadius,
            backgroundColor: "var(--theme-primary)",
            boxShadow: "0 30px 90px var(--theme-primary-shadow)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="relative overflow-hidden rounded-full border-4 border-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
              style={{ height: avatarSize, width: avatarSize, transform: `translateY(${-avatarLift}px)` }}
            >
              <Image
                src="/head.jpg"
                alt="Avatar"
                fill
                sizes={`${avatarSize}px`}
                className="object-cover"
              />
            </div>
          </div>

          <div
            className="absolute left-1/2 flex -translate-x-1/2 items-end gap-2 text-center"
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
          </div>

          <p
            className="absolute left-1/2 w-full max-w-[520px] -translate-x-1/2 text-center text-[18px] font-bold leading-7 tracking-[-0.03em]"
            style={{
              top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 96}px)`,
              color: "var(--theme-primary-text)",
            }}
          >
            曾几何时 稚嫩的小手也拥有了追越我们的坚强
          </p>

          <div
            className="absolute left-1/2 h-[112px] w-full max-w-[560px] -translate-x-1/2"
            style={{
              top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 176}px)`,
            }}
          >
            {visibleLinkCards.map((item, index) => {
              const baseX = index * (homeLinkCardWidth + homeLinkGap);
              const targetX = homeLinkCenterOffset + baseX;

              return (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    startCloseTransition(
                      item.href === "/blog" ? "/return/friend/blog" : "/return/friend/note",
                    )
                  }
                  className="absolute top-0 flex h-[112px] cursor-pointer items-end overflow-hidden px-5 pb-5 text-[24px] font-bold tracking-[-0.03em]"
                  initial={{ x: baseX }}
                  animate={{ x: isLeaving ? baseX : targetX }}
                  transition={{
                    delay: isLeaving ? 0 : 0.12 + index * 0.05,
                    duration: isLeaving ? makeSpaceDuration : 0.48,
                    ease: smoothEase,
                  }}
                  whileHover="hover"
                  style={{
                    left: 0,
                    width: homeLinkCardWidth,
                    borderRadius: panelRadius,
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
                </motion.button>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0"
            style={{
              top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 176}px)`,
              width: homeLinkRowWidth,
              height: 112,
            }}
          >
            <a
              href="/friend"
              ref={friendCardRef}
              className="absolute top-0 flex h-[112px] items-end overflow-hidden px-5 pb-5 text-[24px] font-bold tracking-[-0.03em]"
              style={{
                left: homeLinkCardWidth * 2 + homeLinkGap * 2,
                width: homeLinkCardWidth,
                borderRadius: panelRadius,
                backgroundColor: "var(--theme-panel-bg)",
                color: "var(--theme-panel-text)",
              }}
            >
              <span
                ref={friendLabelRef}
                className="relative z-10 origin-left"
              >
                朋友
              </span>
              <span
                ref={friendIconRef}
                aria-hidden="true"
                className="absolute right-3 top-3 h-[72px] w-[72px] opacity-85"
                style={{
                  backgroundColor: "var(--theme-panel-icon)",
                  ...getMaskStyle("/friends.svg"),
                }}
              />
            </a>
          </div>

          <div
            className="absolute left-1/2 flex w-full max-w-[278px] -translate-x-1/2 justify-between"
            style={{
              bottom: `calc(50% - ${cardHeight / 2}px + 72px)`,
            }}
          >
            {socialCards.map((item) => (
              <motion.div key={item.label} className="flex h-[64px] w-[62px] flex-col items-center">
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
        </motion.section>

        <section
          ref={sectionRef}
          className="absolute left-1/2 top-1/2 z-20 h-[660px] w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-hidden min-[1200px]:left-auto min-[1200px]:right-0 min-[1200px]:translate-x-0"
          style={{
            maxWidth: friendPanelWidth,
            borderRadius: panelRadius,
            backgroundColor: "var(--theme-panel-bg)",
            boxShadow: "0 30px 90px var(--theme-panel-shadow)",
            opacity: isDesktopClosing ? 0 : 1,
            transition: `opacity 0.14s ease-out ${isDesktopClosing ? `${makeSpaceDuration}s` : "0s"}`,
          }}
        >
          <header
            className="absolute inset-x-0 top-0 z-10 h-[112px] px-6 pt-6"
            style={{
              color: "var(--theme-panel-text)",
              opacity: isMobileClosing ? 0 : 1,
              transition: "opacity 0.18s ease-out",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute opacity-85"
              style={{
                left: friendFinalIcon.left,
                top: friendFinalIcon.top,
                width: friendFinalIcon.size,
                height: friendFinalIcon.size,
                backgroundColor: "var(--theme-panel-icon)",
                ...getMaskStyle("/friends.svg"),
              }}
            />
            <h1
              className="absolute text-[24px] font-bold tracking-[-0.03em]"
              style={{
                left: friendFinalLabel.left,
                top: friendFinalLabel.top,
              }}
            >
              朋友
            </h1>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => startCloseTransition()}
              className="absolute right-6 top-[21px] z-20 flex h-[36px] w-[36px] items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "var(--theme-primary-text)",
              }}
              aria-label="关闭朋友页"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-[16px] w-[16px]"
                fill="none"
              >
                <path
                  d="M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="mt-14 flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[12px] font-bold"
                style={{
                  backgroundColor: "var(--theme-chip-bg)",
                  color: "var(--theme-chip-text)",
                }}
              >
                {friends.length} 位朋友
              </span>
            </div>
          </header>

          <div
            className="scrollbar-hidden absolute inset-x-0 bottom-0 top-[112px] overflow-y-auto px-6 pb-6"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              opacity: isMobileClosing ? 0 : 1,
              transition: "opacity 0.18s ease-out",
            }}
          >
            <motion.div
              className="flex flex-col gap-4"
              initial="hidden"
              animate="show"
              variants={listVariants}
            >
              {friends.map((friend) => (
                <motion.a
                  key={friend.id}
                  href={friend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[28px] px-5 py-5 transition-transform duration-200 hover:scale-[1.01]"
                  style={{
                    backgroundColor: "var(--theme-surface-bg)",
                    color: "var(--theme-surface-text)",
                  }}
                  variants={itemVariants}
                >
                  <div className="flex items-start gap-4">
                    {friend.favicon ? (
                      <img
                        src={friend.favicon}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[18px] font-bold"
                        style={{
                          backgroundColor: "var(--theme-chip-bg)",
                          color: "var(--theme-chip-text)",
                        }}
                      >
                        {friend.title.slice(0, 1)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2
                        className="text-[22px] font-bold leading-[1.2] tracking-[-0.03em]"
                        style={{ color: "var(--theme-surface-text)" }}
                      >
                        {friend.title}
                      </h2>

                      <p
                        className="mt-1 line-clamp-1 text-[15px] leading-7"
                        style={{ color: "var(--theme-surface-text)" }}
                      >
                        {friend.description}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {closeTransition ? (
          <motion.div
            className="absolute z-40 overflow-hidden"
            initial={{
              left: closeTransition.source.left,
              top: closeTransition.source.top,
              width: closeTransition.source.width,
              height: closeTransition.source.height,
              borderRadius: panelRadius,
            }}
            animate={{
              left: closeTransition.target.left,
              top: closeTransition.target.top,
              width: closeTransition.target.width,
              height: closeTransition.target.height,
              borderRadius: panelRadius,
            }}
            transition={{
              delay: makeSpaceDuration,
              duration: closeTransitionDuration,
              ease: smoothEase,
            }}
            style={{
              backgroundColor: "var(--theme-panel-bg)",
              boxShadow: "0 30px 90px var(--theme-panel-shadow)",
            }}
          >
            <motion.span
              className="absolute text-[24px] font-bold tracking-[-0.03em]"
              initial={{
                left: closeTransition.label.left,
                top: closeTransition.label.top,
              }}
              animate={{
                left: closeTransition.targetLabel.left,
                top: closeTransition.targetLabel.top,
              }}
              transition={{
                duration: closeTransitionDuration,
                ease: smoothEase,
              }}
              style={{ color: "var(--theme-panel-text)" }}
            >
              朋友
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="absolute opacity-85"
              initial={{
                left: closeTransition.icon.left,
                top: closeTransition.icon.top,
                width: closeTransition.icon.size,
                height: closeTransition.icon.size,
              }}
              animate={{
                left: closeTransition.targetIcon.left,
                top: closeTransition.targetIcon.top,
                width: closeTransition.targetIcon.size,
                height: closeTransition.targetIcon.size,
              }}
              transition={{
                duration: closeTransitionDuration,
                ease: smoothEase,
              }}
              style={{
                backgroundColor: "var(--theme-panel-icon)",
                ...getMaskStyle("/friends.svg"),
              }}
            />
          </motion.div>
        ) : null}

        {isMobileClosing ? (
          <motion.div
            className="absolute left-1/2 top-1/2 z-40 h-[660px] w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 min-[1200px]:hidden"
            style={{
              maxWidth: friendPanelWidth,
              borderRadius: panelRadius,
              backgroundColor: "var(--theme-primary)",
            }}
            initial={{
              clipPath: `circle(18px at ${backRipple.cx}px ${backRipple.cy}px)`,
            }}
            animate={{
              clipPath: `circle(${backRipple.radius}px at ${backRipple.cx}px ${backRipple.cy}px)`,
            }}
            transition={{
              duration: backFillDuration,
              ease: smoothEase,
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
