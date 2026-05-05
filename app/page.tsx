import HeroIntro from "./ui/hero-intro";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  const params = await searchParams;

  return <HeroIntro returningFromBlog={Boolean(params.return)} />;
}
