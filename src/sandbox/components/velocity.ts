import Vec2D from "../math/vec2D";
import Component from "../core/ecs/component";
export interface VelocityProps {
  speed: number;
}
export interface VelocityType extends Velocity {}
export default class Velocity extends Component {
  vel: Vec2DType;
  speed: number;
  constructor(componentProps: ComponentProps, { speed = 3 }: VelocityProps) {
    super(componentProps);
    this.vel = Vec2D.Zero;
    this.speed = speed;
  }
}
