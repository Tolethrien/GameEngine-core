import Entity from "../../core/dogma/entity";
import SignalStore from "../../core/modules/signals/signalStore";
export default class Flask extends Entity {
  constructor(color: RGB, x: number, y: number) {
    super();
    this.addComponent("Transform", {
      position: { x: x, y: y },
      size: { width: 25, height: 25 },
    });
    this.addComponent("SpriteRenderer", {
      type: "spritesheet",
      atlasIndex: 0,
      GPUAtlas: "TextureBatchGame",
      isStatic: false,
      layers: [
        {
          crop: { x: 22 * 32, y: 16 * 32 },
          cropSize: { width: 32, height: 32 },
          bloom: 0,
          tint: color,
        },
      ],
    });
    this.addComponent("MouseEvents", {
      action: { leftClick: () => SignalStore.emit("pickItem", this.id) },
    });
    this.addComponent("IndieRigidBody", {
      bodyType: "dynamic",
      friction: 1,
      mass: 10,
      restitution: 1,
    });
    this.addComponent("PicableItem");
  }
}
