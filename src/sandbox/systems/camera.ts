import { canvas } from "../core/engine";
import Vec2D from "../math/vec2D";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import System from "../core/ecs/system";
import Mat4 from "../math/mat4";
import { TransformType } from "../components/transform";
export default class Cameras extends System {
  playerTransform!: GetExplicitComponent<TransformType>;
  othCam!: GetExplicitComponent<OrthographicCameraType>;
  constructor(props: SystemProps) {
    super(props);
  }
  onStart() {
    this.playerTransform = this.getEntityComponentByTag("transform", "player");
    this.othCam = this.getEntityComponentByTag("orthographicCamera", "player");
  }

  onUpdate() {
    // this.cameraFollow();
    this.cameraFree();
  }
  private cameraFree() {
    this.othCam.projectionViewMatrix = Mat4.create()
      .ortho(
        this.othCam.x * this.othCam.zoom - canvas.width / 2,
        this.othCam.x * this.othCam.zoom + canvas.width / 2,
        this.othCam.y * this.othCam.zoom + canvas.height / 2,
        this.othCam.y * this.othCam.zoom - canvas.height / 2,
        -1,
        1
      )
      .multiply(this.othCam.view)
      .scale(this.othCam.zoom);
  }
  private cameraFollow() {
    this.othCam.projectionViewMatrix = Mat4.create()
      .ortho(
        this.playerTransform.position.get.x * this.othCam.zoom - canvas.width / 2,
        this.playerTransform.position.get.x * this.othCam.zoom + canvas.width / 2,
        this.playerTransform.position.get.y * this.othCam.zoom + canvas.height / 2,
        this.playerTransform.position.get.y * this.othCam.zoom - canvas.height / 2,
        -1,
        1
      )
      .multiply(this.othCam.view)
      .scale(this.othCam.zoom);
  }
  // findPosition() {
  //   return new Vec2D([
  //     this.playerTransform.position.get.x * this.othCam.zoom - this.othCam.offset.x,
  //     this.playerTransform.position.get.y * this.othCam.zoom - this.othCam.offset.y
  //   ]);
  // }
}
