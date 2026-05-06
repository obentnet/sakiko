import { siteConfig } from "../site-config";
import BlogPageShell, { type BlogFeedItem } from "../ui/blog-page-shell";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function extractTag(content: string, tag: string) {
  const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function extractCategories(content: string) {
  return Array.from(content.matchAll(/<category>([\s\S]*?)<\/category>/gi)).map(
    (match) => decodeXml(match[1].trim()),
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatBlogDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function parseFeed(xml: string): BlogFeedItem[] {
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)).map((match) => {
    const item = match[1];
    return {
      title: extractTag(item, "title"),
      link: extractTag(item, "link"),
      pubDateLabel: formatBlogDate(extractTag(item, "pubDate")),
      description: stripHtml(extractTag(item, "description")),
      categories: extractCategories(item),
    };
  });
}

async function getBlogFeed() {
  const response = await fetch(siteConfig.blogFeedUrl);

  if (!response.ok) {
    throw new Error(`Feed request failed: ${response.status}`);
  }

  return parseFeed(await response.text());
}

export default async function BlogPage() {
  const posts = await getBlogFeed();

  return <BlogPageShell posts={posts} />;
}
