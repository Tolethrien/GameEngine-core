import Component from "../../core/dogma/component";
import { clamp } from "../../core/math/math";
//IDEA: swiatlo mogloby miec wysokosc od ziemi i wtedy jesli jest jej blisko zostawia cien(łune)
// na ziemi w kolorze swiatla
export interface PointLightProps {
  type: "radial";
  intencity: number;
  size: { width: number; height: number };
  color: [number, number, number];
}
export interface PointLightType extends PointLight {}
export default class PointLight extends Component {
  typeOfLight: PointLightProps["type"];
  color: PointLightProps["color"];
  intencity: PointLightProps["intencity"];
  size: PointLightProps["size"];
  constructor(
    componentProps: ComponentProps,
    { color, intencity, size, type }: PointLightProps
  ) {
    super(componentProps);
    this.color = color;
    this.intencity = clamp(intencity, 0, 255);
    this.typeOfLight = type;
    this.size = size;
  }
}
