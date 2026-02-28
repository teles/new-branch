import type { TransformDef } from "@/pattern/transforms/types.js";

export const stripAccents: TransformDef = {
  name: "stripAccents",
  fn: (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  doc: {
    summary: "Removes diacritics from characters.",
    usage: ["{title:stripAccents}"],
    examples: ["José → Jose"],
  },
};
