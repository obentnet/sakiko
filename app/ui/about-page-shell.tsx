'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cardHeight, panelRadius, smoothEase } from "./home-transition-constants";

const avatarSize = 152;
const aboutPanelWidth = 680;
const aboutPanelHeight = 980;
const closeCompressDuration = 0.34;
const backFillDuration = 0.42;
const heatmapPalette = [
  "rgba(31, 26, 22, 0.10)",
  "color-mix(in srgb, var(--theme-surface-bg) 82%, var(--theme-primary) 18%)",
  "color-mix(in srgb, var(--theme-chip-bg) 76%, var(--theme-primary) 24%)",
  "color-mix(in srgb, var(--theme-panel-bg) 78%, var(--theme-primary) 22%)",
  "var(--theme-primary)",
] as const;

type AboutPageShellProps = {
  links: {
    home: string;
    blog: string;
    note: string;
    friend: string;
    github: string;
    bilibili: string;
    rss: string;
  };
  activity: {
    username: string;
    totalEvents: number;
    activeDays: number;
    heatmapValues: number[];
  };
};

type ContactCard = {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  external?: boolean;
};

type WorkCard = {
  icon: string;
  title: string;
  body: string;
  href: string;
  external?: boolean;
};

const introParagraphs = [
  "😒 一个失业的23岁少年;",
  "👨‍💻 目前在找工作，喜欢全栈开发、开源和写作;",
] as const;

const skillBadges = [
  { label: "JS", bg: "#f8df4f", fg: "#2a2622" },
  { label: "TS", bg: "#1e88d8", fg: "#ffffff" },
  { label: "Vue", bg: "#eaf4ed", fg: "#35b36f" },
  { label: "Nuxt", bg: "#eaf8f0", fg: "#1abc70" },
  { label: "Node", bg: "#eff6e8", fg: "#72b44b" },
  { label: "CSS", bg: "#eef4ff", fg: "#4f79d9" },
  { label: "Motion", bg: "#ffe8f4", fg: "#d35c98" },
  { label: "UI", bg: "#f6efe5", fg: "#7c5f60" },
] as const;

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

function makeHeatmapValues(columns: number, rows: number) {
  return Array.from({ length: columns * rows }, (_, index) => {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const seed = (column * 5 + row * 7 + column * row) % 19;

    if (seed <= 8) {
      return 0;
    }

    if (seed <= 11) {
      return 1;
    }

    if (seed <= 14) {
      return 2;
    }

    if (seed <= 16) {
      return 3;
    }

    return 4;
  });
}

function SmartAnchor({
  href,
  external = false,
  className,
  style,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export default function AboutPageShell({ links, activity }: AboutPageShellProps) {
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const pushedRef = useRef(false);
  const [closeStage, setCloseStage] = useState<"idle" | "ripple" | "compress">("idle");
  const [backRipple, setBackRipple] = useState({
    cx: 0,
    cy: 0,
    radius: 18,
  });
  const isLeaving = closeStage !== "idle";
  const isRippling = closeStage === "ripple";
  const isCompressing = closeStage === "compress";

  const contactCards: ContactCard[] = [
    {
      title: "github",
      subtitle: "obentnet",
      href: links.github,
      icon: "/social/github.svg",
      external: true,
    },
    {
      title: "bilibili",
      subtitle: "space / 20980892",
      href: links.bilibili,
      icon: "/social/bilibili.svg",
      external: true,
    },
    {
      title: "rss",
      subtitle: "feed / uegee.com",
      href: links.rss,
      icon: "/rss.svg",
      external: true,
    },
    {
      title: "home",
      subtitle: "back to homepage",
      href: links.home,
      icon: "/globe.svg",
    },
  ];

  const workCards: WorkCard[] = [
    {
      icon: "https://uegee.com/android-chrome-512x512.png",
      title: "NeHex",
      body: "次世代个人空间解决方案",
      href: "https://github.com/nehex",
      external: true,
    },
    {
      icon: "https://ushio.ueg.ee/favicon.png",
      title: "Ushio调色板",
      body: "一个收集撞色的小工具站点",
      href: "https://ushio.ueg.ee",
      external: true,
    },
  ];

  const heatmapColumns = 24;
  const heatmapRows = 7;
  const heatmapValues = activity.heatmapValues.length === heatmapColumns * heatmapRows
    ? activity.heatmapValues
    : makeHeatmapValues(heatmapColumns, heatmapRows);
  const monthLabels = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

  const finishBackTransition = useCallback(() => {
    if (pushedRef.current) {
      return;
    }

    pushedRef.current = true;
    startTransition(() => {
      router.push("/return", { scroll: false });
    });
  }, [router]);

  useEffect(() => {
    router.prefetch("/return");
  }, [router]);

  useEffect(() => {
    if (!isRippling) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCloseStage("compress");
    }, backFillDuration * 1000);

    return () => window.clearTimeout(timer);
  }, [isRippling]);

  useEffect(() => {
    if (!isCompressing) {
      return;
    }

    const timer = window.setTimeout(() => {
      finishBackTransition();
    }, closeCompressDuration * 1000);

    return () => window.clearTimeout(timer);
  }, [finishBackTransition, isCompressing]);

  const startBackTransition = () => {
    if (frameRef.current && backButtonRef.current) {
      const frameRect = frameRef.current.getBoundingClientRect();
      const buttonRect = backButtonRef.current.getBoundingClientRect();
      const cx = buttonRect.left - frameRect.left + buttonRect.width / 2;
      const cy = buttonRect.top - frameRect.top + buttonRect.height / 2;
      const radius = Math.hypot(
        Math.max(cx, frameRect.width - cx),
        Math.max(cy, frameRect.height - cy),
      );

      setBackRipple({ cx, cy, radius });
    }

    pushedRef.current = false;
    setCloseStage("ripple");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div ref={frameRef} className="relative h-[1120px] w-full max-w-[760px]">
        <motion.section
          className="absolute left-1/2 top-1/2 h-[980px] w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          initial={false}
          animate={{
            height: isCompressing ? cardHeight : aboutPanelHeight,
          }}
          transition={{
            duration: isCompressing ? closeCompressDuration : 0,
            ease: smoothEase,
          }}
          style={{
            maxWidth: aboutPanelWidth,
            height: aboutPanelHeight,
            borderRadius: panelRadius,
            backgroundColor: "var(--theme-primary)",
            boxShadow: "0 30px 90px var(--theme-primary-shadow)",
          }}
        >
          <button
            ref={backButtonRef}
            type="button"
            onClick={startBackTransition}
            className="absolute right-6 top-6 z-30 flex h-[36px] w-[36px] items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--theme-panel-bg)",
              color: "var(--theme-panel-text)",
            }}
            aria-label="返回首页"
          >
            <span
              aria-hidden="true"
              className="h-[18px] w-[18px]"
              style={{
                backgroundColor: "var(--theme-panel-text)",
                ...getMaskStyle("/back.svg"),
              }}
            />
          </button>

          <div
            className="absolute left-6 top-6 z-20 h-[56px] w-[168px] overflow-hidden rounded-[44px] sm:left-8 sm:top-8 sm:h-[64px] sm:w-[188px]"
            style={{
              backgroundColor: "var(--theme-panel-bg)",
              boxShadow: "0 30px 90px var(--theme-panel-shadow)",
              opacity: isCompressing ? 0 : 1,
              transition: "opacity 0.16s ease-out",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute left-4 top-[19px] h-[18px] w-[18px] opacity-85 sm:left-[18px] sm:top-[21px] sm:h-[20px] sm:w-[20px]"
              style={{
                backgroundColor: "var(--theme-panel-icon)",
                ...getMaskStyle("/about.svg"),
              }}
            />
            <span
              className="absolute left-[46px] top-[15px] text-[18px] font-bold tracking-[-0.03em] sm:left-[50px] sm:top-[17px] sm:text-[20px]"
              style={{ color: "var(--theme-panel-text)" }}
            >
              关于
            </span>
          </div>

          <div className="absolute left-1/2 top-[102px] z-20 -translate-x-1/2">
            <div
              className="relative overflow-hidden rounded-full border-4 border-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
              style={{
                height: avatarSize,
                width: avatarSize,
                opacity: isCompressing ? 0 : 1,
                transition: "opacity 0.16s ease-out",
              }}
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

          <motion.div
            className="scrollbar-hidden absolute inset-x-0 bottom-0 top-[278px] overflow-y-auto px-6 pb-6 sm:top-[290px] sm:px-8 sm:pb-8"
            initial="hidden"
            animate={isLeaving ? "exit" : "show"}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.12,
                },
              },
              exit: {
                transition: {
                  staggerChildren: 0.03,
                  staggerDirection: -1,
                },
              },
            }}
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <motion.div
              className="space-y-5 text-center"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: smoothEase } },
                exit: { opacity: 0, y: 18, transition: { duration: 0.18, ease: smoothEase } },
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/waving-hand.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
                <span
                  className="text-[18px] font-bold tracking-[-0.03em]"
                  style={{ color: "var(--theme-primary-text)" }}
                >
                  Hi!
                </span>
              </div>

              <h1
                className="text-[34px] font-bold leading-none tracking-[-0.05em] sm:text-[42px]"
                style={{ color: "var(--theme-primary-text)" }}
              >
                Im UEGEE
              </h1>

              <p
                className="mx-auto max-w-[420px] text-[16px] font-bold leading-7 tracking-[-0.03em]"
                style={{ color: "var(--theme-primary-text)" }}
              >
               一个穷孩子生活在有钱人的城市
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {["山东 · 日照 / 天津市", "全栈工程师", "Open-source / Anime / Writing"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full px-4 py-2 text-[13px] font-bold tracking-[-0.02em]"
                    style={{
                      backgroundColor: "var(--theme-chip-bg)",
                      color: "var(--theme-chip-text)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div className="mt-8 space-y-4" variants={{ hidden: {}, show: {}, exit: {} }}>
              <motion.article
                className="rounded-[28px] px-6 py-5"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: smoothEase } },
                  exit: { opacity: 0, y: 12, transition: { duration: 0.16, ease: smoothEase } },
                }}
                style={{
                  backgroundColor: "var(--theme-surface-bg)",
                  color: "var(--theme-surface-text)",
                }}
              >
                <h2 className="text-[24px] font-bold tracking-[-0.03em]">关于我</h2>
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[15px] leading-7">
                    {paragraph}
                  </p>
                ))}
              </motion.article>

              <motion.div
                className="grid gap-4 sm:grid-cols-2"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                }}
              >
                {contactCards.map((item) => (
                  <motion.div
                    key={item.title}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: smoothEase } },
                      exit: { opacity: 0, y: 10, transition: { duration: 0.14, ease: smoothEase } },
                    }}
                  >
                    <SmartAnchor
                      href={item.href}
                      external={item.external}
                      className="block rounded-[20px] border px-4 py-3 transition-transform duration-200 hover:-translate-y-1"
                      style={{
                        backgroundColor: "var(--theme-surface-bg)",
                        borderColor: "rgba(31, 26, 22, 0.08)",
                        boxShadow: "0 16px 34px rgba(31, 26, 22, 0.06)",
                      }}
                    >
                      <div className="flex min-h-[52px] items-center gap-3" style={{ color: "var(--theme-surface-text)" }}>
                        <div
                          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px]"
                          style={{
                            backgroundColor: "var(--theme-chip-bg)",
                            color: "var(--theme-chip-text)",
                            boxShadow: "inset 0 0 0 1px rgba(31, 26, 22, 0.04)",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="h-[18px] w-[18px] shrink-0"
                            style={{
                              backgroundColor: "var(--theme-chip-text)",
                              ...getMaskStyle(item.icon),
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.18em]"
                            style={{ color: "var(--theme-surface-muted)" }}
                          >
                            {item.title}
                          </p>
                          <p
                            className="mt-[2px] text-[15px] font-bold leading-[1.1] tracking-[-0.03em]"
                            style={{ color: "var(--theme-surface-text)" }}
                          >
                            {item.subtitle}
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="h-[14px] w-[14px] shrink-0 opacity-45"
                          style={{
                            backgroundColor: "var(--theme-surface-text)",
                            ...getMaskStyle("/globe.svg"),
                          }}
                        />
                      </div>
                    </SmartAnchor>
                  </motion.div>
                ))}
              </motion.div>

              <motion.article
                className="rounded-[28px] px-6 py-5"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: smoothEase } },
                  exit: { opacity: 0, y: 12, transition: { duration: 0.16, ease: smoothEase } },
                }}
                style={{
                  backgroundColor: "var(--theme-surface-bg)",
                  color: "var(--theme-surface-text)",
                }}
              >
                <h2 className="text-[24px] font-bold tracking-[-0.03em]">技能偏好</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {skillBadges.map((item) => (
                    <div
                      key={item.label}
                      className="flex h-[46px] min-w-[46px] items-center justify-center rounded-[14px] px-3 text-[18px] font-bold tracking-[-0.04em]"
                      style={{
                        backgroundColor: item.bg,
                        color: item.fg,
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article
                className="rounded-[28px] px-6 py-5"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: smoothEase } },
                  exit: { opacity: 0, y: 12, transition: { duration: 0.16, ease: smoothEase } },
                }}
                style={{
                  backgroundColor: "var(--theme-surface-bg)",
                  color: "var(--theme-surface-text)",
                }}
              >
                <h2 className="text-[24px] font-bold tracking-[-0.03em]">活跃度</h2>
                <div
                  className="mt-4 grid grid-cols-6 gap-x-4 gap-y-2 text-[12px] font-bold uppercase tracking-[0.16em] sm:grid-cols-12"
                  style={{ color: "var(--theme-surface-muted)" }}
                >
                  {monthLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div
                  className="mt-4 grid gap-[6px]"
                  style={{ gridTemplateColumns: `repeat(${heatmapColumns}, minmax(0, 1fr))` }}
                >
                  {heatmapValues.map((value, index) => (
                    <span
                      key={`${index}-${value}`}
                      className="block aspect-square rounded-[4px]"
                      style={{
                        backgroundColor: heatmapPalette[value],
                      }}
                    />
                  ))}
                </div>

                <div
                  className="mt-4 flex items-center gap-2 text-[12px] font-bold tracking-[0.12em]"
                  style={{ color: "var(--theme-surface-muted)" }}
                >
                  <span>@{activity.username}</span>
                  <span>·</span>
                  <span>{activity.totalEvents} events</span>
                  <span>·</span>
                  <span>{activity.activeDays} active days</span>
                </div>

                <div
                  className="mt-3 flex items-center gap-2 text-[12px] font-bold tracking-[0.12em]"
                  style={{ color: "var(--theme-surface-muted)" }}
                >
                  <span>Less</span>
                  {heatmapPalette.map((color) => (
                    <span
                      key={color}
                      className="block h-[14px] w-[14px] rounded-[4px]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </motion.article>

              <motion.article
                className="rounded-[28px] px-6 py-5"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: smoothEase } },
                  exit: { opacity: 0, y: 12, transition: { duration: 0.16, ease: smoothEase } },
                }}
                style={{
                  backgroundColor: "var(--theme-surface-bg)",
                  color: "var(--theme-surface-text)",
                }}
              >
                <h2 className="text-[24px] font-bold tracking-[-0.03em]">作品入口</h2>
                <div className="mt-4 space-y-4">
                  {workCards.map((item) => (
                    <SmartAnchor
                      key={item.title}
                      href={item.href}
                      external={item.external}
                      className="block rounded-[24px] border px-4 py-4 transition-transform duration-200 hover:-translate-y-1"
                      style={{
                        backgroundColor: "var(--theme-surface-bg)",
                        borderColor: "rgba(31, 26, 22, 0.08)",
                        boxShadow: "0 16px 34px rgba(31, 26, 22, 0.06)",
                      }}
                    >
                      <div className="flex min-h-[72px] items-center gap-4">
                        <div
                          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[16px]"
                          style={{
                            backgroundColor: "var(--theme-chip-bg)",
                            boxShadow: "inset 0 0 0 1px rgba(31, 26, 22, 0.04)",
                          }}
                        >
                          {item.icon.startsWith("http") ? (
                            <img
                              src={item.icon}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="h-[24px] w-[24px]"
                              style={{
                                backgroundColor: "var(--theme-chip-text)",
                                ...getMaskStyle(item.icon),
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-[19px] font-bold leading-[1.15] tracking-[-0.03em]"
                            style={{ color: "var(--theme-surface-text)" }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="mt-1 text-[14px] leading-6 tracking-[-0.02em]"
                            style={{ color: "var(--theme-surface-muted)" }}
                          >
                            {item.body}
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="h-[16px] w-[16px] shrink-0 opacity-45"
                          style={{
                            backgroundColor: "var(--theme-surface-text)",
                            ...getMaskStyle("/globe.svg"),
                          }}
                        />
                      </div>
                    </SmartAnchor>
                  ))}
                </div>
              </motion.article>
            </motion.div>
          </motion.div>
        </motion.section>

        {isLeaving ? (
          <motion.div
            className="absolute left-1/2 top-1/2 z-40 h-[980px] w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px]"
            style={{ backgroundColor: "var(--theme-primary)" }}
            initial={{
              clipPath: `circle(18px at ${backRipple.cx}px ${backRipple.cy}px)`,
            }}
            animate={{
              height: isCompressing ? cardHeight : aboutPanelHeight,
              clipPath:
                closeStage === "ripple"
                  ? `circle(${backRipple.radius}px at ${backRipple.cx}px ${backRipple.cy}px)`
                  : `circle(${backRipple.radius}px at ${backRipple.cx}px ${backRipple.cy}px)`,
            }}
            transition={{
              height: {
                duration: isCompressing ? closeCompressDuration : 0,
                ease: smoothEase,
              },
              clipPath: {
                duration: closeStage === "ripple" ? backFillDuration : 0,
                ease: smoothEase,
              },
              ease: smoothEase,
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
