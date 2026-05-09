'use client'

import { useEffect } from "react";

export default function VChipRegister() {
  useEffect(() => {
    if (!customElements.get("v-chip")) {
      class VChipElement extends HTMLElement {
        static get observedAttributes() {
          return ["bg", "fg"];
        }

        connectedCallback() {
          this.applyColors();
        }

        attributeChangedCallback() {
          this.applyColors();
        }

        private applyColors() {
          const bg = this.getAttribute("bg");
          const fg = this.getAttribute("fg");

          if (bg) {
            this.style.setProperty("--v-chip-bg", bg);
          } else {
            this.style.removeProperty("--v-chip-bg");
          }

          if (fg) {
            this.style.setProperty("--v-chip-fg", fg);
          } else {
            this.style.removeProperty("--v-chip-fg");
          }
        }
      }

      customElements.define("v-chip", VChipElement);
    }
  }, []);

  return null;
}
