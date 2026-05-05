import NotePageShell, { type NoteItem } from "../ui/note-page-shell";

type DailyResponse = {
  data: Array<{
    id: number;
    title: string;
    content: string | null;
    create_time: string;
    weather: string | null;
    daily_type: string;
  }>;
};

function formatNoteDate(value: string) {
  const datePart = value.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value;
  }

  return datePart.replace(/-/g, "/");
}

async function getNotes() {
  const response = await fetch("https://nehex-console.uegee.com/daily");

  if (!response.ok) {
    throw new Error(`Daily request failed: ${response.status}`);
  }

  const payload = (await response.json()) as DailyResponse;
  return payload.data
    .filter((item) => item.daily_type === "note")
    .map(
      (item) =>
        ({
          id: item.id,
          title: item.title,
          content: item.content,
          create_time_label: formatNoteDate(item.create_time),
          weather: item.weather,
          daily_type: item.daily_type,
        }) satisfies NoteItem,
    );
}

export default async function NotePage() {
  const notes = await getNotes();

  return <NotePageShell notes={notes} />;
}
