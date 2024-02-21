import System from "../../core/dogma/system";
import Vec2D from "../../core/math/vec2D";
import InputManager from "../../core/modules/inputManager/inputManager";
import NaviCore from "../../core/navigpu/core";
import { AnimationType } from "../components/animation";
import { IndieRigidBodyType } from "../components/indieRigidBody";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import { TransformType } from "../components/transform";
export default class KeyInputs extends System {
  playerRigid!: GetExplicitComponent<IndieRigidBodyType>;
  playerAnim!: GetExplicitComponent<AnimationType>;
  othCam!: GetExplicitComponent<OrthographicCameraType>;
  pos!: GetExplicitComponent<TransformType>;
  constructor() {
    super();
  }
  onSubscribeList(): void {
    this.playerRigid = this.getEntityComponentByTag("IndieRigidBody", "player");
    this.playerAnim = this.getEntityComponentByTag("Animation", "player");
    this.othCam = this.getEntityComponentByTag("OrthographicCamera", "player");
    this.pos = this.getEntityComponentByTag("Transform", "player");
  }
  onUpdate() {
    let dirX = 0;
    let dirY = 0;
    if (InputManager.isKeyHold("w")) {
      this.playerAnim.layerData[0].state = "top";
      dirY--;
    } else if (InputManager.isKeyHold("s")) {
      this.playerAnim.layerData[0].state = "down";
      dirY++;
    }
    if (InputManager.isKeyHold("a")) {
      this.playerAnim.layerData[0].state = "left";
      dirX--;
    } else if (InputManager.isKeyHold("d")) {
      this.playerAnim.layerData[0].state = "right";
      dirX++;
    }

    if (InputManager.isKeyHold("ArrowRight"))
      this.othCam.x += this.othCam.speed / Math.log(this.othCam.zoom + 1);
    else if (InputManager.isKeyHold("ArrowLeft"))
      this.othCam.x -= this.othCam.speed / Math.log(this.othCam.zoom + 1);
    if (InputManager.isKeyHold("ArrowUp"))
      this.othCam.y -= this.othCam.speed / Math.log(this.othCam.zoom + 1);
    else if (InputManager.isKeyHold("ArrowDown"))
      this.othCam.y += this.othCam.speed / Math.log(this.othCam.zoom + 1);
    if (InputManager.isKeyHold("n")) {
      if (this.othCam.zoom > this.othCam.minZoom) {
        this.othCam.zoom -= 0.01 * Math.log(this.othCam.zoom + 1);
      }
    } else if (InputManager.isKeyHold("m")) {
      if (this.othCam.zoom < this.othCam.maxZoom) {
        this.othCam.zoom += 0.01 * Math.log(this.othCam.zoom + 1);
      }
    }
    if (InputManager.isKeyPressed("l")) {
      const dis = NaviCore.getNodeByID("inventory")?.getDisabled;
      NaviCore.getNodeByID("inventory")?.setDisable(!dis);
      // NaviCore.nodes.get("inve").removeChildByIndex(1);
      // console.log(NaviCore.nodes);
      // console.log(NaviCore.mouseCallbacks);
    }

    this.playerRigid.velocity = new Vec2D([dirX, dirY]);
    const forcedirection = new Vec2D([dirX, dirY]).normalize();
    const forceVector = forcedirection.multiply(this.playerRigid.newtons);
    this.playerRigid.force = forceVector;
  }
}
