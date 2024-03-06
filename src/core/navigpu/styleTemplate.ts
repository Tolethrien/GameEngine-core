export interface NodeStyle {
  backgroundColor: number[];
  textureCrop: number[];
  alpha: number;
  backgroundTexture: number | undefined;
  orientation: "column" | "row";
  position: "auto" | "manual";
  left: number;
  top: number;
  width: number;
  height: number;
  alignX: "left" | "center" | "right";
  alignY: "top" | "center" | "bottom";
  fontSize: number;
  fontFace: string;
}
export const nodeStyle: NodeStyle = {
  alpha: 255,
  backgroundColor: [0, 0, 0],
  textureCrop: [0, 0, 1, 1],
  backgroundTexture: undefined,
  orientation: "column",
  position: "auto",
  alignX: "left",
  alignY: "top",
  height: 0,
  width: 0,
  left: 0,
  top: 0,
  fontSize: 16,
  fontFace: "roboto",
};
