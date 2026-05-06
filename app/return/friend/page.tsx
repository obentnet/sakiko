import { heroIntroLinks } from "../../site-config";
import HeroIntro from "../../ui/hero-intro";

export default function ReturnFromFriendPage() {
  return (
    <HeroIntro
      returningFromDetail
      returningFromFriend
      {...heroIntroLinks}
    />
  );
}
