import { OrthographicCameraProps } from "../components/OrthographicCamera";
import { AnimationProps } from "../components/animation";
import { SpriteRendererProps } from "../components/spriteRenderer";
import { IndieRigidBodyProps } from "../components/indieRigidBody";
import { MouseEventsProps } from "../components/mouseEvents";
import { PointLightProps } from "../components/pointLight";
import { TransformProps } from "../components/transform";
import Entity from "../../core/ecs/entity";
export default class Player extends Entity {
  constructor() {
    super();
    this.addTag("player");
    // this.addComponent<MeshProps>("mesh", {
    //   type: "shape",
    //   round: 0,
    //   color: [0, 250, 0],
    //   alpha: 0.5
    // });
    this.addComponent<SpriteRendererProps>("spriteRenderer", {
      type: "sprite",
      image: "vite",
      GPUAtlas: "char",
      isStatic: true,
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
    this.addComponent<TransformProps>("transform", {
      position: { x: 511, y: 33 },
      size: { width: 32, height: 32 },
      rotation: 0,
    });
    this.addComponent<OrthographicCameraProps>("orthographicCamera");
    this.addComponent<AnimationProps>("animation", {
      animationSpeed: 8,
      state: "down",
      cropSize: { width: 32, height: 32 },
      spriteSheet: { gpuAtlas: "char", image: "cyberu" },
      animationData: {
        top: { numberOfFrames: 6, rowInSpritesheet: 4 },
        down: { numberOfFrames: 6, rowInSpritesheet: 1 },
        left: { numberOfFrames: 6, rowInSpritesheet: 2 },
        right: { numberOfFrames: 6, rowInSpritesheet: 3 },
      },
      isAnimate: false,
    });
    this.addComponent<IndieRigidBodyProps>("indieRigidBody", {
      bodyType: "dynamic",
      mass: 10,
      friction: 0,
      // offset: { x: 0, y: 16, w: 32, h: 16 }
    });
    this.addComponent<MouseEventsProps>("mouseEvents", {
      action: { left: "sdsd", right: "sss" },
      objectType: "translated",
    });
    this.addComponent<PointLightProps>("pointLight", {
      color: "white",
      intencity: 1,
      typeOfLight: "radial",
    });
  }
}
