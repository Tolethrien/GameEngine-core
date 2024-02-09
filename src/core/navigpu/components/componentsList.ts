import NaviChildren from "./children";
import NaviMouseEvent from "./mouseEvents";
export type NaviComponents = keyof typeof naviComponents;
export const naviComponents = {
  NaviChildren,
  NaviMouseEvent,
};
