import { siteConfig } from "../site-config";
import AboutPageShell from "../ui/about-page-shell";

const GITHUB_ACTIVITY_USERNAME = "obentnet";
const GITHUB_EVENT_WINDOW_DAYS = 35;
const GITHUB_DISPLAY_COLUMNS = 24;
const GITHUB_EVENT_ROWS = 7;

type GitHubEvent = {
  created_at: string;
};

function buildEmptyActivity() {
  return {
    username: GITHUB_ACTIVITY_USERNAME,
    totalEvents: 0,
    activeDays: 0,
    heatmapValues: Array.from({ length: GITHUB_DISPLAY_COLUMNS * GITHUB_EVENT_ROWS }, () => 0),
  };
}

async function fetchGitHubActivity() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (GITHUB_EVENT_WINDOW_DAYS - 1));
  start.setHours(0, 0, 0, 0);

  try {
    const responses = await Promise.all(
      Array.from({ length: 3 }, (_, pageIndex) =>
        fetch(
          `https://api.github.com/users/${GITHUB_ACTIVITY_USERNAME}/events/public?per_page=100&page=${pageIndex + 1}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2026-03-10",
              "User-Agent": "sakiko-about-page",
            },
          },
        ),
      ),
    );

    const events = (
      await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            return [] as GitHubEvent[];
          }

          return (await response.json()) as GitHubEvent[];
        }),
      )
    )
      .flat()
      .filter((event) => {
        const createdAt = new Date(event.created_at);
        return createdAt >= start && createdAt <= now;
      });

    const countsByDay = new Map<string, number>();
    for (const event of events) {
      const key = event.created_at.slice(0, 10);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }

    const activeWindowValues = Array.from({ length: GITHUB_EVENT_WINDOW_DAYS }, (_, index) => {
      const dayOffset = GITHUB_EVENT_WINDOW_DAYS - 1 - index;
      const date = new Date(start);
      date.setDate(start.getDate() + dayOffset);
      const key = date.toISOString().slice(0, 10);
      const count = countsByDay.get(key) ?? 0;

      if (count === 0) {
        return 0;
      }

      if (count <= 2) {
        return 1;
      }

      if (count <= 4) {
        return 2;
      }

      if (count <= 7) {
        return 3;
      }

      return 4;
    });

    const heatmapValues = Array.from({ length: GITHUB_DISPLAY_COLUMNS * GITHUB_EVENT_ROWS }, () => 0);
    const startIndex = Math.max(heatmapValues.length - activeWindowValues.length, 0);
    activeWindowValues.forEach((value, index) => {
      heatmapValues[startIndex + index] = value;
    });

    return {
      username: GITHUB_ACTIVITY_USERNAME,
      totalEvents: events.length,
      activeDays: countsByDay.size,
      heatmapValues,
    };
  } catch {
    return buildEmptyActivity();
  }
}

export default async function AboutPage() {
  const activity = await fetchGitHubActivity();

  return (
    <AboutPageShell
      links={{
        home: "/",
        blog: "/blog",
        note: "/note",
        friend: "/friend",
        github: siteConfig.githubUrl,
        bilibili: siteConfig.bilibiliUrl,
        rss: siteConfig.blogFeedUrl,
      }}
      activity={activity}
    />
  );
}
