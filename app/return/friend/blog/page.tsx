import { heroIntroLinks } from "../../../site-config";
import HeroIntro from "../../../ui/hero-intro";

export default function ReturnFromFriendToBlogPage() {
  return (
    <HeroIntro
      returningFromDetail
      returningFromFriend
      autoOpenKind="blog"
      {...heroIntroLinks}
    />
  );
}
