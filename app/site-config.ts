import "server-only";

function readEnv(name: string, fallback = "") {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function requireEnv(name: string) {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const siteConfig = {
  title: readEnv("title", "Site"),
  favicon: readEnv("favicon"),
  blogFeedUrl: requireEnv("blog"),
  noteApiUrl: requireEnv("note"),
  friendUrl: requireEnv("friend"),
  bilibiliUrl: requireEnv("bilibili_link"),
  githubUrl: requireEnv("github_link"),
  twitterUrl: readEnv("twitter_link", "#"),
  donateUrl: requireEnv("donate_link"),
} as const;

export const heroIntroLinks = {
  socialLinks: {
    bilibili: siteConfig.bilibiliUrl,
    github: siteConfig.githubUrl,
    twitter: siteConfig.twitterUrl,
    donate: siteConfig.donateUrl,
  },
} as const;
