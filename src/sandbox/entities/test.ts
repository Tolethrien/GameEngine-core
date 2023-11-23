import Entity from "../core/ecs/entity";
import { OrthographicCameraProps } from "../components/OrthographicCamera";
import { AnimationProps } from "../components/animation";
import { SpriteRendererProps } from "../components/spriteRenderer";
import { IndieRigidBodyProps } from "../components/indieRigidBody";
import { MouseEventsProps } from "../components/mouseEvents";
import { PointLightProps } from "../components/pointLight";
import { TransformProps } from "../components/transform";
import tete from "../../../assets/webGpuMap.json";
export default class Tester extends Entity {
  constructor(x, y, z, p, f) {
    super();
    //TODO: zastanowic sie czy nie lepiej zrobic bazy obiektow i po prostu odnosci sie do niej zamiast przekazywac kazdemu obiektowi crop
    //TODO: w sumie nie musisz miec chunkow, mozesz tile wczytywac bezposrednio z jsona, a zmienianie chunkow moze odbywac sie na tym ze jesli player jest wiecej niz promien chunka to ustaw odpowiedni nastepny ergo wczytaj odpowiednie nowe
    //TODO: wczytanie chunka to po prostu stworzenie nowych tilow dla niego, bezposrednio z JSONA za pomoca indexu
    const tetedata = tete.chunks[0].tiles[0].tileData;
    this.addTag("tester");
    this.addComponent<SpriteRendererProps>("spriteRenderer", {
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
          alpha: data.tint[3]
        };
      })
    });
    this.addComponent<TransformProps>("transform", {
      position: { x: x, y: y },
      size: { width: 32, height: 32 },
      rotation: 0
    });
    // this.addComponent<MeshProps>("mesh", {
    //   type: "shape",
    //   round: 0,
    //   color: [255, 250, 0],
    //   alpha: 0.5
    // });
    this.addComponent<AnimationProps>("animation", {
      animationSpeed: 8,
      state: "down",
      animationData: {
        top: { numberOfFrames: 6, rowInSpritesheet: 4 },
        down: { numberOfFrames: 6, rowInSpritesheet: 1 },
        left: { numberOfFrames: 6, rowInSpritesheet: 2 },
        right: { numberOfFrames: 6, rowInSpritesheet: 3 }
      },
      isAnimate: true,
      cropSize: { height: 32, width: 32 },
      spriteSheet: { gpuAtlas: "char", image: "vite" }
    });
    this.addComponent<IndieRigidBodyProps>("indieRigidBody", {
      bodyType: z,
      mass: p,
      friction: f
    });
    this.addComponent<MouseEventsProps>("mouseEvents", {
      action: { left: "sdsd", right: "sss" },
      objectType: "translated"
    });
    this.addComponent<PointLightProps>("pointLight", {
      color: "red",
      intencity: 5,
      typeOfLight: "radial"
    });
  }
}
