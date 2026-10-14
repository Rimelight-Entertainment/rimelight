import { defineTheme } from "../../resolver";

export const RLRouteAnnouncerTheme = defineTheme("route-announcer", {
  slots: ["root"],
  base: {
    root: "sr-only",
  },
});
