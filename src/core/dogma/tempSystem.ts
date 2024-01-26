import { TransformType } from "../../sandbox/components/transform";
import Player from "../../sandbox/entities/player";
import EntityManager from "./entityManager";
import System from "./system";

export default class TempSystem extends System {
  private rigids!: GetComponentsList<TransformType>;
  private rigid2s!: GetExplicitComponent<TransformType>;
  constructor() {
    super();
  }
  onSubscribeList(): void {
    this.rigids = this.getComponents("Transform");
    this.rigid2s = this.getEntityComponentByTag("Transform", "player");
  }
  onStart() {
    console.log(this.rigid2s);
  }
  onUpdate() {
    // EntityManager.addEntityOnLoop(new Player());
    // console.log(this.rigids);
  }
}
