'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  aboutFinalIcon,
  aboutFinalLabel,
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
  panelRadius,
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
const imageRevealDelay = socialDelay + 0.24 + 0.45 + 0.12;
const imageRevealDuration = 0.72;
const imageExitDuration = 0.34;
const returnAvatarDuration = 0.42;
const returnTitleDelay = 0.44;
const returnSubtitleDelay = 0.58;
const returnLinksDelay = 0.86;
const returnSocialDelay = 1.12;
const friendReturnOffset = -300;
const friendReturnDuration = 0.62;
const autoOpenDelay = friendReturnDuration + 0.04;
const returnImageRevealDelay = returnSocialDelay + 0.45 + 0.12;
const friendReturnImageRevealDelay = friendReturnDuration + 0.14;
const topIntroImages = ["/new-eromanga.png", "/new-eromanga_2.png"] as const;
const introAssetSources = ["/head.jpg", ...topIntroImages];
const introBlackoutFadeDuration = 0.42;
const aboutTransitionDuration = 0.74;
const topImageBlurDuration = 0.24;
const topImageSharpenDuration = 0.28;
const topImageSwitchBlur = 20;

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
type TransitionCardKind = "blog" | "note" | "about" | "friend";
type TopImageSwapStage = "idle" | "blurring" | "sharpening";

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

type AboutTransitionSnapshot = {
  route: string;
  panel: {
    left: number;
    top: number;
    width: number;
    height: number;
    targetLeft: number;
    targetTop: number;
    targetWidth: number;
    targetHeight: number;
  };
  avatar: {
    left: number;
    top: number;
    size: number;
    targetLeft: number;
    targetTop: number;
    targetSize: number;
  };
  card: {
    left: number;
    top: number;
    width: number;
    height: number;
    targetLeft: number;
    targetTop: number;
    targetWidth: number;
    targetHeight: number;
  };
  label: {
    left: number;
    top: number;
    fontSize: number;
    targetLeft: number;
    targetTop: number;
    targetFontSize: number;
  };
  icon: {
    left: number;
    top: number;
    size: number;
    opacity: number;
    targetLeft: number;
    targetTop: number;
    targetSize: number;
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

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function waitForFontsReady() {
  if (!("fonts" in document)) {
    return Promise.resolve();
  }

  return document.fonts.ready.then(() => undefined);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;

    if (image.complete) {
      resolve();
    }
  });
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
    case "about":
      return {
        labelText: "关于",
        iconPath: "/about.svg",
        route: "/about",
        finalLabel: aboutFinalLabel,
        finalIcon: aboutFinalIcon,
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
  const shouldGateIntro = !returningFromDetail;
  const imageEntryDelay = returningFromDetail
    ? returningFromFriend
      ? friendReturnImageRevealDelay
      : returnImageRevealDelay
    : imageRevealDelay;
  const linkCards = [
    { kind: "blog" as const, label: "博文", icon: "/home.svg" },
    { kind: "note" as const, label: "随笔", icon: "/note.svg" },
    { kind: "about" as const, label: "关于", icon: "/about.svg" },
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
  const aboutPanelTargetRef = useRef<HTMLDivElement | null>(null);
  const aboutAvatarTargetRef = useRef<HTMLDivElement | null>(null);
  const aboutCardTargetRef = useRef<HTMLDivElement | null>(null);
  const avatarShellRef = useRef<HTMLDivElement | null>(null);
  const blogCardRef = useRef<HTMLButtonElement | null>(null);
  const blogLabelRef = useRef<HTMLSpanElement | null>(null);
  const blogIconRef = useRef<HTMLSpanElement | null>(null);
  const noteCardRef = useRef<HTMLButtonElement | null>(null);
  const noteLabelRef = useRef<HTMLSpanElement | null>(null);
  const noteIconRef = useRef<HTMLSpanElement | null>(null);
  const aboutCardRef = useRef<HTMLButtonElement | null>(null);
  const aboutLabelRef = useRef<HTMLSpanElement | null>(null);
  const aboutIconRef = useRef<HTMLSpanElement | null>(null);
  const friendCardRef = useRef<HTMLButtonElement | null>(null);
  const friendLabelRef = useRef<HTMLSpanElement | null>(null);
  const friendIconRef = useRef<HTMLSpanElement | null>(null);
  const pushedRef = useRef(false);
  const autoOpenTriggeredRef = useRef(false);
  const [isIntroReady, setIsIntroReady] = useState(!shouldGateIntro);
  const [isBlackoutVisible, setIsBlackoutVisible] = useState(shouldGateIntro);
  const [cardStage, setCardStage] = useState<CardTransitionStage>("idle");
  const [cardTransition, setCardTransition] =
    useState<CardTransitionSnapshot | null>(null);
  const [aboutTransition, setAboutTransition] =
    useState<AboutTransitionSnapshot | null>(null);
  const [aboutSourceHidden, setAboutSourceHidden] = useState(false);
  const [topImageIndex, setTopImageIndex] = useState(0);
  const [topImageSwapStage, setTopImageSwapStage] =
    useState<TopImageSwapStage>("idle");
  const isTopImageSwitching = topImageSwapStage !== "idle";
  const isAboutTransitioning = aboutTransition !== null;

  useEffect(() => {
    if (!shouldGateIntro) {
      return;
    }

    let cancelled = false;

    const prepareIntro = async () => {
      await Promise.all([
        waitForWindowLoad(),
        waitForFontsReady(),
        Promise.allSettled(introAssetSources.map((src) => preloadImage(src))),
      ]);

      if (cancelled) {
        return;
      }

      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setIsIntroReady(true);
        }
      });
    };

    prepareIntro();

    return () => {
      cancelled = true;
    };
  }, [shouldGateIntro]);

  useEffect(() => {
    if (!isIntroReady) {
      return;
    }

    router.prefetch("/blog");
    router.prefetch("/note");
    router.prefetch("/about");
    router.prefetch("/friend");
  }, [isIntroReady, router]);

  useEffect(() => {
    if (!isIntroReady) {
      return;
    }

    if (!autoOpenKind) {
      return;
    }

    router.prefetch(
      autoOpenKind === "blog"
        ? "/blog"
        : autoOpenKind === "note"
          ? "/note"
          : "/about",
    );
  }, [autoOpenKind, isIntroReady, router]);

  const finishCardTransition = useCallback(() => {
    if (pushedRef.current || !cardTransition) {
      return;
    }

    pushedRef.current = true;
    startTransition(() => {
      router.push(cardTransition.route, { scroll: false });
    });
  }, [cardTransition, router]);

  const finishAboutTransition = useCallback(() => {
    if (pushedRef.current || !aboutTransition) {
      return;
    }

    pushedRef.current = true;
    startTransition(() => {
      router.push(aboutTransition.route, { scroll: false });
    });
  }, [aboutTransition, router]);

  useEffect(() => {
    if (!isIntroReady) {
      return;
    }

    if (aboutTransition) {
      const frame = window.requestAnimationFrame(() => {
        setAboutSourceHidden(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setAboutSourceHidden(false);

    return;
  }, [aboutTransition, isIntroReady]);

  useEffect(() => {
    if (!isIntroReady) {
      return;
    }

    if (aboutTransition) {
      const timer = window.setTimeout(() => {
        finishAboutTransition();
      }, aboutTransitionDuration * 1000);

      return () => window.clearTimeout(timer);
    }

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
  }, [aboutTransition, cardStage, finishAboutTransition, finishCardTransition, isIntroReady]);

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
      case "about":
        return {
          cardRef: aboutCardRef.current,
          labelRef: aboutLabelRef.current,
          iconRef: aboutIconRef.current,
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
      case "about":
        return {
          cardRef: aboutCardRef,
          labelRef: aboutLabelRef,
          iconRef: aboutIconRef,
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
    if (kind === "about") {
      if (
        aboutTransition ||
        cardTransition ||
        !frameRef.current ||
        !backgroundCardRef.current ||
        !avatarShellRef.current ||
        !aboutCardRef.current ||
        !aboutLabelRef.current ||
        !aboutIconRef.current ||
        !aboutPanelTargetRef.current ||
        !aboutAvatarTargetRef.current ||
        !aboutCardTargetRef.current
      ) {
        return;
      }

      const frameRect = frameRef.current.getBoundingClientRect();
      const backgroundRect = backgroundCardRef.current.getBoundingClientRect();
      const avatarRect = avatarShellRef.current.getBoundingClientRect();
      const cardRect = aboutCardRef.current.getBoundingClientRect();
      const labelRect = aboutLabelRef.current.getBoundingClientRect();
      const iconRect = aboutIconRef.current.getBoundingClientRect();
      const panelTargetRect = aboutPanelTargetRef.current.getBoundingClientRect();
      const avatarTargetRect = aboutAvatarTargetRef.current.getBoundingClientRect();
      const cardTargetRect = aboutCardTargetRef.current.getBoundingClientRect();
      const sourceLabelFontSize = Number.parseFloat(
        window.getComputedStyle(aboutLabelRef.current).fontSize,
      );
      const isDesktopAboutTarget = cardTargetRect.width >= 180;
      const targetLabel = isDesktopAboutTarget
        ? { left: 50, top: 17, fontSize: 20 }
        : { left: 46, top: 15, fontSize: 18 };
      const targetIcon = isDesktopAboutTarget
        ? { left: 18, top: 21, size: 20 }
        : { left: 16, top: 19, size: 18 };
      const hasVisibleSourceIcon = iconRect.width > 0 && iconRect.height > 0;
      const sourceIconSize = hasVisibleSourceIcon ? iconRect.width : 18;
      const sourceIconLeft = hasVisibleSourceIcon
        ? iconRect.left - cardRect.left
        : cardRect.width / 2 - sourceIconSize / 2;
      const sourceIconTop = hasVisibleSourceIcon
        ? iconRect.top - cardRect.top
        : cardRect.height / 2 - sourceIconSize / 2;

      pushedRef.current = false;
      setAboutTransition({
        route: "/about",
        panel: {
          left: backgroundRect.left - frameRect.left,
          top: backgroundRect.top - frameRect.top,
          width: backgroundRect.width,
          height: backgroundRect.height,
          targetLeft: panelTargetRect.left - frameRect.left,
          targetTop: panelTargetRect.top - frameRect.top,
          targetWidth: panelTargetRect.width,
          targetHeight: panelTargetRect.height,
        },
        avatar: {
          left: avatarRect.left - frameRect.left,
          top: avatarRect.top - frameRect.top,
          size: avatarRect.width,
          targetLeft: avatarTargetRect.left - frameRect.left,
          targetTop: avatarTargetRect.top - frameRect.top,
          targetSize: avatarTargetRect.width,
        },
        card: {
          left: cardRect.left - frameRect.left,
          top: cardRect.top - frameRect.top,
          width: cardRect.width,
          height: cardRect.height,
          targetLeft: cardTargetRect.left - frameRect.left,
          targetTop: cardTargetRect.top - frameRect.top,
          targetWidth: cardTargetRect.width,
          targetHeight: cardTargetRect.height,
        },
        label: {
          left: labelRect.left - cardRect.left,
          top: labelRect.top - cardRect.top,
          fontSize: Number.isFinite(sourceLabelFontSize) ? sourceLabelFontSize : 16,
          targetLeft: targetLabel.left,
          targetTop: targetLabel.top,
          targetFontSize: targetLabel.fontSize,
        },
        icon: {
          left: sourceIconLeft,
          top: sourceIconTop,
          size: sourceIconSize,
          opacity: hasVisibleSourceIcon ? 0.85 : 0,
          targetLeft: targetIcon.left,
          targetTop: targetIcon.top,
          targetSize: targetIcon.size,
        },
      });
      return;
    }

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
    if (!isIntroReady) {
      return;
    }

    if (!autoOpenKind || autoOpenTriggeredRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      autoOpenTriggeredRef.current = true;
      startCardTransition(autoOpenKind);
    }, autoOpenDelay * 1000);

    return () => window.clearTimeout(timer);
  }, [autoOpenKind, isIntroReady]);

  const toggleTopImage = () => {
    if (!isIntroReady || cardTransition || isAboutTransitioning || isTopImageSwitching) {
      return;
    }

    setTopImageSwapStage("blurring");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {!isIntroReady || isBlackoutVisible ? (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-50 bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: isIntroReady ? 0 : 1 }}
          transition={{
            duration: introBlackoutFadeDuration,
            ease: smoothEase,
          }}
          onAnimationComplete={() => {
            if (isIntroReady) {
              setIsBlackoutVisible(false);
            }
          }}
        />
      ) : null}
      <LayoutGroup>
        <div
          ref={frameRef}
          className="relative h-[820px] w-full max-w-[1120px]"
          style={{ maxWidth: friendFrameWidth }}
        >
          {!isIntroReady ? null : (
            <>
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
              className="absolute left-1/2 top-1/2 z-0 w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2"
              initial={
                returningFromDetail
                  ? { scale: 1, opacity: 1, x: 0 }
                  : { scale: 0.18, opacity: 0 }
              }
              animate={
                isAboutTransitioning
                  ? { scale: 1, opacity: 0, x: 0, y: 0 }
                  : { scale: 1, opacity: 1, x: 0, y: 0 }
              }
              transition={{
                delay: isAboutTransitioning ? 0 : returningFromDetail ? 0 : cardDelay,
                duration: isAboutTransitioning
                  ? aboutTransitionDuration
                  : returningFromDetail
                    ? 0
                    : cardDuration,
                ease: smoothEase,
              }}
              style={{
                height: cardHeight,
                borderRadius: panelRadius,
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

            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[1120px] w-full max-w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-0"
            >
              <div className="absolute left-1/2 top-1/2 h-[980px] w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[44px]">
                <div
                  ref={aboutPanelTargetRef}
                  className="absolute inset-0"
                />
                <div
                  ref={aboutCardTargetRef}
                  className="absolute left-6 top-6 h-[56px] w-[168px] sm:left-8 sm:top-8 sm:h-[64px] sm:w-[188px]"
                />
                <div
                  ref={aboutAvatarTargetRef}
                  className="absolute left-1/2 top-[102px] h-[152px] w-[152px] -translate-x-1/2"
                />
              </div>
            </div>

            <motion.button
              type="button"
              onClick={toggleTopImage}
              onDragStart={(event) => {
                event.preventDefault();
              }}
              className="absolute left-1/2 top-1/2 z-20 hidden cursor-pointer border-0 bg-transparent p-0 sm:block sm:h-[280px] sm:w-[242px] sm:translate-x-[76px] sm:-translate-y-[554px]"
              aria-label="切换插图"
              initial={
                returningFromDetail
                  ? { opacity: 0, filter: "blur(18px)" }
                  : { opacity: 0, filter: "blur(18px)" }
              }
              animate={
                cardTransition || isAboutTransitioning
                  ? { opacity: 0, filter: "blur(22px)" }
                  : topImageSwapStage === "blurring"
                    ? { opacity: 1, filter: `blur(${topImageSwitchBlur}px)` }
                    : { opacity: 1, filter: "blur(0px)" }
              }
              transition={{
                delay:
                  cardTransition || isAboutTransitioning || topImageSwapStage !== "idle"
                    ? 0
                    : imageEntryDelay,
                duration: cardTransition || isAboutTransitioning
                  ? imageExitDuration
                  : topImageSwapStage === "idle"
                    ? imageRevealDuration
                    : topImageSwapStage === "blurring"
                      ? topImageBlurDuration
                      : topImageSharpenDuration,
                ease: smoothEase,
              }}
              onAnimationComplete={() => {
                if (topImageSwapStage === "blurring") {
                  setTopImageIndex((current) => (current + 1) % topIntroImages.length);
                  setTopImageSwapStage("sharpening");
                  return;
                }

                if (topImageSwapStage === "sharpening") {
                  setTopImageSwapStage("idle");
                }
              }}
            >
              <Image
                src={topIntroImages[topImageIndex]}
                alt=""
                fill
                sizes="242px"
                className="object-contain object-top"
                priority
                draggable={false}
              />
            </motion.button>

            <div
              ref={avatarShellRef}
              className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${isAboutTransitioning && aboutSourceHidden ? "opacity-0" : ""}`}
            >
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
                    draggable={false}
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
              animate={isAboutTransitioning ? { opacity: 0, y: 0, x: 0 } : { opacity: 1, y: 0, x: 0 }}
              transition={{
                delay: isAboutTransitioning
                  ? 0
                  : returningFromDetail
                    ? isStaticFriendReturn
                      ? 0
                      : returnTitleDelay
                    : titleDelay,
                duration: isAboutTransitioning ? aboutTransitionDuration : isStaticFriendReturn ? 0 : 0.4,
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
              animate={isAboutTransitioning ? { opacity: 0, y: 0, x: 0 } : { opacity: 1, y: 0, x: 0 }}
              transition={{
                delay: isAboutTransitioning
                  ? 0
                  : returningFromDetail
                    ? isStaticFriendReturn
                      ? 0
                      : returnSubtitleDelay
                    : subtitleDelay,
                duration: isAboutTransitioning ? aboutTransitionDuration : isStaticFriendReturn ? 0 : 0.42,
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
              className="absolute left-1/2 z-10 grid w-full max-w-[560px] -translate-x-1/2 grid-cols-2 gap-2 sm:flex sm:gap-4"
              style={{
                top: `calc(50% - ${avatarLift}px + ${avatarSize / 2 + 176}px)`,
              }}
            >
              {linkCards.map((item, index) => {
                const isActive = cardTransition?.kind === item.kind || (isAboutTransitioning && item.kind === "about");
                const { cardRef, labelRef, iconRef } = getCardRefHandles(item.kind);

                if (isActive && !(isAboutTransitioning && item.kind === "about")) {
                  return (
                    <div
                      key={item.label}
                      className="h-[56px] min-w-0 sm:h-[112px] sm:flex-1"
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
                    className="relative flex h-[56px] min-w-0 cursor-pointer items-center justify-center overflow-hidden px-2 text-[16px] font-bold tracking-[-0.03em] sm:h-[112px] sm:flex-1 sm:items-end sm:justify-start sm:px-5 sm:pb-5 sm:text-[24px]"
                    initial={{
                      opacity: isStaticFriendReturn ? 1 : 0,
                      y: isStaticFriendReturn ? 0 : 20,
                      x: 0,
                    }}
                    animate={
                      isAboutTransitioning
                        ? item.kind === "about"
                          ? { opacity: aboutSourceHidden ? 0 : 1, y: 0, x: 0 }
                          : { opacity: 0, y: 0, x: 0 }
                        : { opacity: 1, y: 0, x: 0 }
                    }
                    whileHover="hover"
                    transition={{
                      delay: isAboutTransitioning
                        ? 0
                        : ((returningFromDetail && !isStaticFriendReturn)
                          ? returnLinksDelay
                          : returningFromDetail
                            ? 0
                            : linksDelay) +
                        index * 0.08,
                      duration: isAboutTransitioning ? aboutTransitionDuration : isStaticFriendReturn ? 0 : 0.45,
                      ease: smoothEase,
                    }}
                    style={{
                      borderRadius: panelRadius,
                      backgroundColor: "var(--theme-panel-bg)",
                      color: "var(--theme-panel-text)",
                    }}
                  >
                    <motion.span
                      ref={labelRef}
                      className="relative z-10 origin-center sm:origin-left"
                      variants={linkLabelVariants}
                    >
                      {item.label}
                    </motion.span>
                  <motion.span
                    ref={iconRef}
                    aria-hidden="true"
                    className="absolute right-3 top-3 hidden h-[72px] w-[72px] opacity-85 sm:block"
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
                    animate={isAboutTransitioning ? { opacity: 0, y: 0, x: 0 } : { opacity: 1, y: 0, x: 0 }}
                  transition={{
                    delay: isAboutTransitioning
                      ? 0
                      : ((returningFromDetail && !isStaticFriendReturn)
                        ? returnSocialDelay
                        : returningFromDetail
                          ? 0
                          : socialDelay) +
                      index * 0.08,
                    duration: isAboutTransitioning ? aboutTransitionDuration : isStaticFriendReturn ? 0 : 0.45,
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
                borderRadius: panelRadius,
              }}
              style={{
                left: cardTransition.target.left,
                top: cardTransition.target.top,
                width: cardTransition.source.width,
                height: cardTransition.source.height,
                borderRadius: panelRadius,
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

          {aboutTransition ? (
            <>
              <motion.div
                className="absolute z-30 overflow-hidden rounded-[44px]"
                initial={{
                  left: aboutTransition.panel.left,
                  top: aboutTransition.panel.top,
                  width: aboutTransition.panel.width,
                  height: aboutTransition.panel.height,
                }}
                animate={{
                  left: aboutTransition.panel.targetLeft,
                  top: aboutTransition.panel.targetTop,
                  width: aboutTransition.panel.targetWidth,
                  height: aboutTransition.panel.targetHeight,
                }}
                transition={{
                  duration: aboutTransitionDuration,
                  ease: smoothEase,
                }}
                style={{
                  backgroundColor: "var(--theme-primary)",
                  boxShadow: "0 30px 90px var(--theme-primary-shadow)",
                }}
              />

              <motion.div
                className="absolute z-40 overflow-hidden rounded-full border-4 border-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
                initial={{
                  left: aboutTransition.avatar.left,
                  top: aboutTransition.avatar.top,
                  width: aboutTransition.avatar.size,
                  height: aboutTransition.avatar.size,
                }}
                animate={{
                  left: aboutTransition.avatar.targetLeft,
                  top: aboutTransition.avatar.targetTop,
                  width: aboutTransition.avatar.targetSize,
                  height: aboutTransition.avatar.targetSize,
                }}
                transition={{
                  duration: aboutTransitionDuration,
                  ease: smoothEase,
                }}
              >
                <Image
                  src="/head.jpg"
                  alt="Avatar"
                  fill
                  sizes={`${avatarSize}px`}
                  draggable={false}
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                className="absolute z-40 overflow-hidden"
                initial={{
                  left: aboutTransition.card.left,
                  top: aboutTransition.card.top,
                  width: aboutTransition.card.width,
                  height: aboutTransition.card.height,
                  borderRadius: panelRadius,
                }}
                animate={{
                  left: aboutTransition.card.targetLeft,
                  top: aboutTransition.card.targetTop,
                  width: aboutTransition.card.targetWidth,
                  height: aboutTransition.card.targetHeight,
                  borderRadius: panelRadius,
                }}
                transition={{
                  duration: aboutTransitionDuration,
                  ease: smoothEase,
                }}
                style={{
                  backgroundColor: "var(--theme-panel-bg)",
                  boxShadow: "0 30px 90px var(--theme-panel-shadow)",
                }}
              >
                <motion.span
                  className="absolute z-10 font-bold tracking-[-0.03em]"
                  initial={{
                    left: aboutTransition.label.left,
                    top: aboutTransition.label.top,
                    fontSize: aboutTransition.label.fontSize,
                  }}
                  animate={{
                    left: aboutTransition.label.targetLeft,
                    top: aboutTransition.label.targetTop,
                    fontSize: aboutTransition.label.targetFontSize,
                  }}
                  transition={{
                    duration: aboutTransitionDuration,
                    ease: smoothEase,
                  }}
                  style={{ color: "var(--theme-panel-text)" }}
                >
                  关于
                </motion.span>
                <motion.span
                  aria-hidden="true"
                  className="absolute"
                  initial={{
                    left: aboutTransition.icon.left,
                    top: aboutTransition.icon.top,
                    width: aboutTransition.icon.size,
                    height: aboutTransition.icon.size,
                    opacity: aboutTransition.icon.opacity,
                  }}
                  animate={{
                    left: aboutTransition.icon.targetLeft,
                    top: aboutTransition.icon.targetTop,
                    width: aboutTransition.icon.targetSize,
                    height: aboutTransition.icon.targetSize,
                    opacity: 0.85,
                  }}
                  transition={{
                    duration: aboutTransitionDuration,
                    ease: smoothEase,
                  }}
                  style={{
                    backgroundColor: "var(--theme-panel-icon)",
                    ...getMaskStyle("/about.svg"),
                  }}
                />
              </motion.div>
            </>
          ) : null}
            </>
          )}

        </div>
      </LayoutGroup>
    </main>
  );
}
