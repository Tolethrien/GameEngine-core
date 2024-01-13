import Component from "../../core/ecs/component";
import { canvas } from "../../core/engine";
import Mat4 from "../../core/math/mat4";
import Vec2D from "../../core/math/vec2D";

export interface OrthographicCameraProps {
  zoom?: number;
  offset?: { x: number; y: number };
  position?: { x: number; y: number };
  zoomClamp?: { min: number; max: number };
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
    {
      zoom = 1,
      offset = { x: canvas.width / 2, y: canvas.height / 2 },
      zoomClamp = { min: 0.1, max: 10 },
    }: OrthographicCameraProps
  ) {
    super(componentProps);
    this.zoom = zoom;
    this.offset = offset;
    this.position = Vec2D.Zero;
    this.projectionViewMatrix = Mat4.create();
    this.view = Mat4.create().lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0]);
    this.x = canvas.width / 2 - 200;
    this.y = canvas.height / 2 - 400;
    this.speed = 5;
    this.minZoom = zoomClamp.min;
    this.maxZoom = zoomClamp.max;
  }
}
