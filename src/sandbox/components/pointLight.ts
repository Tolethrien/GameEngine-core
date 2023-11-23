import Component from "../core/ecs/component";
export interface PointLightProps {
  typeOfLight: "radial";
  color: "white" | "yellow" | "red" | "blue";
  intencity: number;
}
export interface PointLightType extends PointLight {}
export default class PointLight extends Component {
  typeOfLight: PointLightProps["typeOfLight"];
  color: PointLightProps["color"];
  intencity: PointLightProps["intencity"];
  constructor(componentProps: ComponentProps, { color, intencity, typeOfLight }: PointLightProps) {
    super(componentProps);
    this.color = color;
    this.intencity = intencity;
    this.typeOfLight = typeOfLight;
  }
}
