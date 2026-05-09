import type * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "v-chip": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        bg?: string;
        fg?: string;
      };
    }
  }
}
