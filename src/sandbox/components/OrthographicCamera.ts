import { canvas } from "../core/engine";
import Vec2D from "../math/vec2D";
import Component from "../core/ecs/component";
import Mat4 from "../math/mat4";
export interface OrthographicCameraProps {
  zoom?: number;
  offset?: { x: number; y: number };
  position?: { x: number; y: number };
}
export interface OrthographicCameraType extends OrthographicCamera {}
export default class OrthographicCamera extends Component {
  view: Mat4;
  projectionViewMatrix: Mat4;
  x: number;
  y: number;
  speed: number;
  zoom: number;
  maxZoom: number;
  minZoom: number;
  offset?: { x: number; y: number };
  position?: Vec2DType;
  constructor(
    componentProps: ComponentProps,
    { zoom = 1, offset = { x: canvas.width / 2, y: canvas.height / 2 } }: OrthographicCameraProps
  ) {
    super(componentProps);
    this.zoom = zoom;
    this.offset = offset;
    this.position = Vec2D.Zero;
    this.projectionViewMatrix = Mat4.create();
    this.view = Mat4.create().lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0]);
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 5;
    // this.zoom = 1;
    this.maxZoom = 10;
    this.minZoom = 0.1;
  }
}
// export interface OrthographicCameraProps {
//   zoom?: number;
//   offset?: { x: number; y: number };
//   position?: { x: number; y: number };
// }
// export interface OrthographicCameraType extends OrthographicCamera {}
// export default class OrthographicCamera extends Component {
//   zoom: number;
//   offset: { x: number; y: number };
//   position: Vec2DType;

//   constructor(
//     componentProps: ComponentProps,
//     { zoom = 1, offset = { x: canvas.width / 2, y: canvas.height / 2 } }: OrthographicCameraProps
//   ) {
//     super(componentProps);
//     this.zoom = zoom;
//     this.offset = offset;
//     this.position = Vec2D.Zero;
//   }
// }
