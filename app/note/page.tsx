import NotePageShell, { type NoteItem } from "../ui/note-page-shell";

type DailyResponse = {
  data: NoteItem[];
};

async function getNotes() {
  const response = await fetch("https://nehex-console.uegee.com/daily", {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Daily request failed: ${response.status}`);
  }

  const payload = (await response.json()) as DailyResponse;
  return payload.data.filter((item) => item.daily_type === "note");
}

export default async function NotePage() {
  const notes = await getNotes();

  return <NotePageShell notes={notes} />;
}
