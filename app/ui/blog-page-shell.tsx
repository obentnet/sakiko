'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { blogFinalIcon, blogFinalLabel, smoothEase } from "./home-transition-constants";

export type BlogFeedItem = {
  title: string;
  link: string;
  pubDateLabel: string;
  description: string;
  categories: string[];
};

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

const backFillDuration = 0.42;

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

export default function BlogPageShell({ posts }: { posts: BlogFeedItem[] }) {
  const router = useRouter();
  const pushedRef = useRef(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const [backRipple, setBackRipple] = useState({
    cx: 638,
    cy: 39,
    radius: 18,
  });

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
    if (!isLeaving) {
      return;
    }

    const timer = window.setTimeout(() => {
      finishBackTransition();
    }, backFillDuration * 1000);

    return () => window.clearTimeout(timer);
  }, [finishBackTransition, isLeaving]);

  const startBackTransition = () => {
    if (sectionRef.current && backButtonRef.current) {
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const buttonRect = backButtonRef.current.getBoundingClientRect();
      const cx = buttonRect.left - sectionRect.left + buttonRect.width / 2;
      const cy = buttonRect.top - sectionRect.top + buttonRect.height / 2;
      const radius = Math.hypot(
        Math.max(cx, sectionRect.width - cx),
        Math.max(cy, sectionRect.height - cy),
      );

      setBackRipple({ cx, cy, radius });
    }

    pushedRef.current = false;
    setIsLeaving(true);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="relative h-[820px] w-full max-w-[720px]">
        <section
          ref={sectionRef}
          className="absolute left-1/2 top-1/2 h-[660px] w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[44px]"
          style={{
            backgroundColor: "var(--theme-panel-bg)",
            boxShadow: "0 30px 90px var(--theme-panel-shadow)",
          }}
        >
          <header
            className="absolute inset-x-0 top-0 z-10 h-[86px]"
            style={{ color: "var(--theme-panel-text)" }}
          >
            <span
              aria-hidden="true"
              className="absolute opacity-85"
              style={{
                left: blogFinalIcon.left,
                top: blogFinalIcon.top,
                width: blogFinalIcon.size,
                height: blogFinalIcon.size,
                backgroundColor: "var(--theme-panel-icon)",
                ...getMaskStyle("/home.svg"),
              }}
            />
            <h1
              className="absolute text-[24px] font-bold tracking-[-0.03em]"
              style={{
                left: blogFinalLabel.left,
                top: blogFinalLabel.top,
              }}
            >
              博文
            </h1>
            <button
              ref={backButtonRef}
              type="button"
              onClick={startBackTransition}
              className="absolute right-6 top-[21px] z-20 flex h-[36px] w-[36px] items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "var(--theme-primary-text)",
              }}
              aria-label="返回首页"
            >
              <span
                aria-hidden="true"
                className="h-[18px] w-[18px]"
                style={{
                  backgroundColor: "var(--theme-primary-text)",
                  ...getMaskStyle("/back.svg"),
                }}
              />
            </button>
          </header>

          <div
            className="scrollbar-hidden absolute inset-x-0 bottom-0 top-[86px] overflow-y-auto px-6 pb-6"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              opacity: isLeaving ? 0 : 1,
              transition: "opacity 0.18s ease-out",
            }}
          >
            <motion.div
              className="flex flex-col gap-4"
              initial="hidden"
              animate="show"
              variants={listVariants}
            >
              {posts.map((post) => (
                <motion.a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[28px] px-6 py-5 transition-transform duration-200 hover:scale-[1.01]"
                  style={{
                    backgroundColor: "var(--theme-surface-bg)",
                    color: "var(--theme-surface-text)",
                  }}
                  variants={itemVariants}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2
                      className="text-[24px] font-bold leading-[1.2] tracking-[-0.03em]"
                      style={{ color: "var(--theme-surface-text)" }}
                    >
                      {post.title}
                    </h2>
                    <span
                      className="shrink-0 pt-1 text-[13px] font-bold"
                      style={{ color: "var(--theme-surface-muted)" }}
                    >
                      {post.pubDateLabel}
                    </span>
                  </div>

                  <p
                    className="mt-3 line-clamp-3 text-[15px] leading-7"
                    style={{ color: "var(--theme-surface-text)" }}
                  >
                    {post.description}
                  </p>

                  {post.categories.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <span
                          key={`${post.link}-${category}`}
                          className="rounded-full px-3 py-1 text-[12px] font-bold"
                          style={{
                            backgroundColor: "var(--theme-chip-bg)",
                            color: "var(--theme-chip-text)",
                          }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {isLeaving ? (
          <motion.div
            className="absolute left-1/2 top-1/2 z-40 h-[660px] w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px]"
            style={{ backgroundColor: "var(--theme-primary)" }}
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
