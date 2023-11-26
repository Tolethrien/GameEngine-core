import Component from "../../core/ecs/component";
import { clamp } from "../../core/math/math";
import Vec2D from "../../core/math/vec2D";

export interface IndieRigidBodyProps {
  bodyType: "static" | "dynamic";
  offset?: { x: number; y: number; w: number; h: number };
  mass?: number;
  friction?: number;
  restitution?: number;
  speed?: number;
}
export interface IndieRigidBodyType extends IndieRigidBody {}
export default class IndieRigidBody extends Component {
  readonly bodyType: "static" | "dynamic";
  mass: number;
  friction: number;
  readonly inverceMass: number;
  restitution: number;
  velocity: Vec2DType;
  force: Vec2DType;
  newtons: number;
  offset: { x: number; y: number; w: number; h: number } | undefined;
  cashedColiderData: { x: number; y: number; w: number; h: number } | undefined;

  constructor(
    componentProps: ComponentProps,
    {
      bodyType = "static",
      mass = 0,
      friction = 0.1,
      restitution = 0.6,
      speed = 240,
      offset = undefined,
    }: IndieRigidBodyProps
  ) {
    super(componentProps);
    this.bodyType = bodyType;
    this.cashedColiderData = undefined;
    this.offset = offset;
    this.force = Vec2D.Zero;
    this.mass = mass * 1000;
    this.newtons = clamp(speed, 10, 1000);
    this.friction = clamp(friction, 0, 1); // 0-1
    this.restitution = clamp(restitution, 0, 1); // 0-1
    this.inverceMass = this.mass === 0 ? 0 : 1 / this.mass;
    this.velocity = Vec2D.Zero;
  }
}
