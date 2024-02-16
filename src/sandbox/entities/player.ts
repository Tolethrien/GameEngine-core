import Entity from "../../core/dogma/entity";

export default class Player extends Entity {
  constructor() {
    super();
    this.addTag("player");
    this.addComponent("SpriteRenderer", {
      type: "spritesheet",
      atlasIndex: 1,
      GPUAtlas: "userTextureAtlas",
      isStatic: false,
      layers: [
        { crop: { x: 0, y: 0 }, cropSize: { width: 32, height: 32 }, bloom: 1 },
      ],
    });
    this.addComponent("Animation", {
      cropSize: { width: 32, height: 32 },
      spriteSheet: { gpuAtlas: "userTextureAtlas", atlasIndex: 1 },
      animationData: {
        top: { numberOfFrames: 6, rowInSpritesheet: 4 },
        down: { numberOfFrames: 6, rowInSpritesheet: 1 },
        left: { numberOfFrames: 6, rowInSpritesheet: 2 },
        right: { numberOfFrames: 6, rowInSpritesheet: 3 },
      },
      layers: [
        {
          renderLayerIndex: 0,
          state: "down",
          animationSpeed: 8,
          isAnimate: true,
          stopOnAnimationFinished: false,
        },
      ],
    });
    // this.addComponent<SpriteRendererProps>("spriteRenderer", {
    //   type: "shape",
    //   offset: { h: 4 * 32, w: 32, x: 0, y: 0, isStatic: false },
    //   tint: [255, 255, 255],
    //   alpha: 255
    // });
    // this.addComponent<SpriteRendererProps>("spriteRenderer", {
    //   type: "sprite",
    //   GPUAtlas: "char",
    //   image: "ss",
    //   offset: { h: 4 * 32, w: 32, x: 0, y: 0, isStatic: false },
    //   tint: [255, 255, 255],
    //   alpha: 255
    // });
    this.addComponent("Transform", {
      position: { x: 615, y: 615 },
      size: { width: 32, height: 32 },
      rotation: 0,
    });
    this.addComponent("OrthographicCamera");
    this.addComponent("IndieRigidBody", {
      bodyType: "dynamic",
      mass: 10,
      friction: 0,
      speed: 240,
      offset: { x: 0, y: 16, w: 32, h: 16 },
    });
    this.addComponent("MouseEvents", {
      action: { left: "sdsd", right: "sss" },
      objectType: "translated",
    });
    // this.addComponent("PointLight", {
    //   color: [255, 50, 50],
    //   intencity: 255,
    //   type: "radial",
    //   size: { width: 100, height: 100 },
    // });
    this.addComponent("PlayerInventory");
  }
}
