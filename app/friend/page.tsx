import { heroIntroLinks, siteConfig } from "../site-config";
import FriendPageShell, { type FriendItem } from "../ui/friend-page-shell";

type FriendResponse = {
  data: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    favicon: string | null;
    url: string;
    status: string;
    create_time: string;
  }>;
};

function formatFriendDate(value: string) {
  const datePart = value.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value;
  }

  return datePart.replace(/-/g, "/");
}

async function getFriends() {
  const response = await fetch(siteConfig.friendUrl);

  if (!response.ok) {
    throw new Error(`Friend request failed: ${response.status}`);
  }

  const payload = (await response.json()) as FriendResponse;

  return payload.data.map(
    (item) =>
      ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        favicon: item.favicon,
        url: item.url,
        status: item.status,
        createTimeLabel: formatFriendDate(item.create_time),
      }) satisfies FriendItem,
  );
}

export default async function FriendPage() {
  const friends = await getFriends();

  return <FriendPageShell friends={friends} socialLinks={heroIntroLinks.socialLinks} />;
}
