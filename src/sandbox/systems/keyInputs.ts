import Vec2D from "../math/vec2D";
import { AnimationType } from "../components/animation";
import { IndieRigidBodyType } from "../components/indieRigidBody";
import System from "../core/ecs/system";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import { TransformType } from "../components/transform";
export default class KeyInputs extends System {
  playerRigid!: GetExplicitComponent<IndieRigidBodyType>;
  playerAnim!: GetExplicitComponent<AnimationType>;
  keyPressed: Set<string>;
  othCam!: GetExplicitComponent<OrthographicCameraType>;
  pos!: GetExplicitComponent<TransformType>;

  constructor(list: SystemProps) {
    super(list);
    this.keyPressed = new Set();
    this.handleKeyInputs();
  }
  onStart() {
    this.playerRigid = this.getEntityComponentByTag("indieRigidBody", "player");
    this.playerAnim = this.getEntityComponentByTag("animation", "player");
    this.othCam = this.getEntityComponentByTag("orthographicCamera", "player");
    this.pos = this.getEntityComponentByTag("transform", "player");
  }
  onUpdate() {
    let dirX = 0;
    let dirY = 0;
    if (this.keyPressed.has("w")) {
      this.playerAnim.state = "top";
      dirY--;
    } else if (this.keyPressed.has("s")) {
      this.playerAnim.state = "down";
      dirY++;
    }
    if (this.keyPressed.has("a")) {
      this.playerAnim.state = "left";
      dirX--;
    } else if (this.keyPressed.has("d")) {
      this.playerAnim.state = "right";
      dirX++;
    }
    if (this.keyPressed.has("ArrowRight"))
      this.othCam.x += this.othCam.speed / Math.log(this.othCam.zoom + 1);
    else if (this.keyPressed.has("ArrowLeft"))
      this.othCam.x -= this.othCam.speed / Math.log(this.othCam.zoom + 1);
    if (this.keyPressed.has("ArrowUp"))
      this.othCam.y -= this.othCam.speed / Math.log(this.othCam.zoom + 1);
    else if (this.keyPressed.has("ArrowDown"))
      this.othCam.y += this.othCam.speed / Math.log(this.othCam.zoom + 1);
    if (this.keyPressed.has("n"))
      this.othCam.zoom > this.othCam.minZoom &&
        (this.othCam.zoom -= 0.01 * Math.log(this.othCam.zoom + 1));
    else if (this.keyPressed.has("m"))
      this.othCam.zoom < this.othCam.maxZoom &&
        (this.othCam.zoom += 0.01 * Math.log(this.othCam.zoom + 1));
    if (this.keyPressed.has("k")) this.pos.position = this.pos.position.set([512, 512]);
    this.playerRigid.velocity = new Vec2D([dirX, dirY]);
    const forcedirection = new Vec2D([dirX, dirY]).normalize();
    const forceVector = forcedirection.multiply(this.playerRigid.newtons);
    this.playerRigid.force = forceVector;
  }

  // onKeyPressed(key: string, callback: () => void) {
  //   if (this.keyPressed.size !== 0 && this.keyPressed.has(key)) {
  //     console.log(key);
  //     this.keyPressed.delete(key);
  //   }
  // }
  // onKeyHold(keys: string, callback: () => void, errorKeys?: keyTypes[]) {
  //   if (keyPressed.size !== 0 && keys.every((e) => (keyPressed.has(e) ? true : false))) {
  //     if (errorKeys && errorKeys.length !== 0) {
  //       if (errorKeys.every((e) => (keyPressed.has(e) ? false : true))) {
  //         callback();
  //       }
  //     } else {
  //       callback();
  //     }
  //   }
  // }
  handleKeyInputs() {
    window.onkeydown = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      !event.repeat && this.keyPressed.add(pressedKey);
    };
    window.onkeyup = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      this.keyPressed.has(pressedKey) && this.keyPressed.delete(pressedKey);
    };
  }
}
