import { heroIntroLinks } from "../../../site-config";
import HeroIntro from "../../../ui/hero-intro";

export default function ReturnFromFriendToNotePage() {
  return (
    <HeroIntro
      returningFromDetail
      returningFromFriend
      autoOpenKind="note"
      {...heroIntroLinks}
    />
  );
}
