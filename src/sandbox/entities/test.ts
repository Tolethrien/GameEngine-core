import tete from "../../assets/webGpuMap.json";
import Entity from "../../core/dogma/entity";
export default class Tester extends Entity {
  constructor(x, y, z, p, f) {
    super();
    const tetedata = tete.chunks[0].tiles[0].tileData;
    this.addTag("tester");
    this.addComponent("SpriteRenderer", {
      type: "spritesheet",
      image: "vite",
      GPUAtlas: "char",
      isStatic: false,
      //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
      layers: tetedata.map((data) => {
        return {
          crop: { x: data.crop[0] * 32, y: data.crop[1] * 32 },
          offset: data.offset ?? undefined,
          cropSize: { width: data.crop[2] * 32, height: data.crop[3] * 32 },
          tint: [data.tint[0], data.tint[1], data.tint[2]],
          alpha: data.tint[3],
        };
      }),
    });
    this.addComponent("Transform", {
      position: { x: x, y: y },
      size: { width: 32, height: 32 },
      rotation: 0,
    });

    this.addComponent("Animation", {
      animationSpeed: 8,
      state: "down",
      animationData: {
        top: { numberOfFrames: 6, rowInSpritesheet: 4 },
        down: { numberOfFrames: 6, rowInSpritesheet: 1 },
        left: { numberOfFrames: 6, rowInSpritesheet: 2 },
        right: { numberOfFrames: 6, rowInSpritesheet: 3 },
      },
      isAnimate: true,
      cropSize: { height: 32, width: 32 },
      spriteSheet: { gpuAtlas: "char", image: "vite" },
    });
    this.addComponent("IndieRigidBody", {
      bodyType: z,
      mass: p,
      friction: f,
    });
    this.addComponent("MouseEvents", {
      action: { left: "sdsd", right: "sss" },
      objectType: "translated",
    });
    this.addComponent("PointLight", {
      color: "red",
      intencity: 5,
      typeOfLight: "radial",
    });
  }
}
