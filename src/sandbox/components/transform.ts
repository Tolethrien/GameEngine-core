import Component from "../../core/dogma/component";
import Vec2D from "../../core/math/vec2D";

export interface TransformProps {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation?: number;
}
export interface TransformType extends Transform {}
export default class Transform extends Component {
  position: Vec2DType;
  size: Vec2DType;
  rotation: number;
  constructor(
    componentProps: ComponentProps,
    {
      position = { x: 10, y: 10 },
      size = { width: 20, height: 20 },
      rotation = 0,
    }: TransformProps
  ) {
    super(componentProps);
    this.position = new Vec2D([position.x, position.y]);
    this.size = new Vec2D([size.width, size.height]);
    this.rotation = rotation;
  }
}
