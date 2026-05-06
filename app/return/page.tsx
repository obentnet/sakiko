import { heroIntroLinks } from "../site-config";
import HeroIntro from "../ui/hero-intro";

export default function ReturnPage() {
  return <HeroIntro returningFromDetail {...heroIntroLinks} />;
}
