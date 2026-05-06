import { heroIntroLinks } from "./site-config";
import HeroIntro from "./ui/hero-intro";

export default function HomePage() {
  return <HeroIntro returningFromDetail={false} {...heroIntroLinks} />;
}
