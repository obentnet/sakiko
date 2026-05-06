import { heroIntroLinks } from "../../../site-config";
import HeroIntro from "../../../ui/hero-intro";

export default function ReturnFriendAboutPage() {
  return (
    <HeroIntro
      returningFromDetail
      returningFromFriend
      autoOpenKind="about"
      {...heroIntroLinks}
    />
  );
}
