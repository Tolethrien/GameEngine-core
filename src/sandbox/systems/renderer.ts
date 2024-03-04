import { IndieRigidBodyType } from "../components/indieRigidBody";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import { TransformType } from "../components/transform";
import { SpriteRendererType } from "../components/spriteRenderer";
import { GroundRendererType } from "../components/groundRenderer";
import AuroraBatcher from "../../core/aurora/urp/batcher";
import RenderFrame from "../../core/debugger/renderStats/renderFrame";
import { PointLightType } from "../components/pointLight";
import System from "../../core/dogma/system";
import Draw from "../../core/aurora/urp/draw";
import NaviBody from "../../core/navigpu/elements/body";
import NaviCore from "../../core/navigpu/core";
import Vec2D from "../../core/math/vec2D";
import Vec4D from "../../core/math/vec4D";
export default class Renderer extends System {
  transforms!: GetComponentsList<TransformType>;
  spriteRenderers!: GetComponentsList<SpriteRendererType>;
  groundRenderers!: GetComponentsList<GroundRendererType>;
  lights!: GetComponentsList<PointLightType>;
  rigids!: GetComponentsList<IndieRigidBodyType>;
  othCam!: GetExplicitComponent<OrthographicCameraType>;
  textureBind!: GPUBindGroup;
  cameraBind!: GPUBindGroup;
  projectionUniform!: GPUBuffer;
  el!: NaviBody;
  constructor() {
    super();
  }
  onSubscribeList() {
    this.transforms = this.getComponents("Transform");
    this.spriteRenderers = this.getComponents("SpriteRenderer");
    this.groundRenderers = this.getComponents("GroundRenderer");
    this.lights = this.getComponents("PointLight");
    this.rigids = this.getComponents("IndieRigidBody");
    this.othCam = this.getEntityComponentByTag("OrthographicCamera", "player");
  }

  onUpdate() {
    AuroraBatcher.setCameraBuffer(this.othCam.projectionViewMatrix.getMatrix);
    AuroraBatcher.setGlobalColorCorrection([0.2, 0.15, 0.08]);
    // AuroraBatcher.setScreenShader("grayscale", 0.7);
    AuroraBatcher.startBatch();
    NaviCore.renderGUI();

    this.groundRenderers?.forEach((ground) => {
      //TODO: potencjalny performance boost, nie musisz co frame aktualizowac listy ziemi bo buffer zmienia sie tylko
      // w momencie kiedy dodajesz/usuwasz nowe chunki, caly czas potem stoi bez zmian - osobny buffer na ziemie?
      const transform = this.transforms.get(ground.entityID)!;
      ground.layers.forEach((layer) => {
        //TODO: blad gdzie na poczatku gry masz skos 5ms na kilka sekund by potem zniknac
        // wystepuje tutaj w drawQuadzie z jakiegos powodu i tylko przy ruchu postaci
        // pomimo iz ten draw sie wykonuje non stop pred ruchem postaci i nie ma problemu wczesniej!
        // im szybciej sie rusze tym mniejszy czas czekania na poprawe, jak sie rusze odrazu to sie nie dzieje

        Draw.Quad({
          position: {
            x: transform.position.x,
            y: transform.position.y,
          },
          size: {
            width: transform.size.x,
            height: transform.size.y,
          },
          textureToUse: layer.textureIndex,
          tint: layer.tint,
          alpha: layer.alpha,
          crop: layer.cashedCropData,
          isTexture: layer.isTexture,
          bloom: layer.bloom,
        });
      });
    });

    Array.from(this.spriteRenderers.values())
      .sort(this.sortByPositionY)
      .forEach((renderer) => {
        renderer.layers.forEach((layer, index) => {
          const { h, w, x, y } = this.getDataFromCash(renderer, index);
          Draw.Quad({
            position: {
              x: x,
              y: y,
            },
            size: {
              width: w,
              height: h,
            },
            textureToUse: layer.textureIndex,
            tint: layer.tint,
            alpha: layer.alpha,
            crop: layer.cashedCropData,
            isTexture: layer.isTexture,
            bloom: layer.bloom,
          });
        });
      });
    this.lights.forEach((light) => {
      const transform = this.transforms.get(light.entityID)!;

      Draw.Light({
        intensity: light.intencity,
        position: { x: transform.position.get.x, y: transform.position.get.y },
        size: light.size,
        tint: light.color,
        type: light.typeOfLight,
      });
    });
    Draw.Light({
      intensity: 255,
      position: { x: 1718 + 100, y: 870 },
      size: { width: 300, height: 150 },
      tint: [200, 0, 0],
      type: "radial",
    });
    Draw.Text({
      alpha: 255,
      bloom: 1,
      color: new Uint8ClampedArray([250, 190, 190]),
      position: { x: 1710, y: 870 },
      text: "light weight baby!",
      textureToUse: 0,
      fontFace: "roboto",
      fontSize: 30,
    });
    // const rend = AuroraBatcher.getRendererData;
    // const opt = AuroraBatcher.getOptionsData;
    // RenderFrame.setGameData({
    //   lightCurrent: rend.lights,
    //   quadsCurrent: rend.quads,
    //   lightsLimit: opt.maxLightsPerSceen,
    //   quadsLimit: opt.maxQuadPerSceen,
    //   blooming: opt.bloom,
    //   bloomStr: opt.bloomStrength,
    //   camera: opt.customCamera ? "custome" : "built-in",
    //   colorCorr: rend.colorCorr,
    //   globalEffect: rend.globalEffect.type,
    //   globalEffectStr: rend.globalEffect.str,
    //   lighting: opt.lights,
    //   computeCalls: AuroraBatcher.getGPUCalls.compute,
    //   drawCalls: AuroraBatcher.getGPUCalls.render,
    // });

    RenderFrame.swapToGPU();
    AuroraBatcher.endBatch();
  }
  private sortByPositionY = (a: SpriteRendererType, b: SpriteRendererType) => {
    const transformA = this.transforms.get(a.entityID)!;
    const transformB = this.transforms.get(b.entityID)!;
    return (
      transformA.position.get.y +
      transformA.size.get.y -
      (transformB.position.get.y + transformB.size.get.y)
    );
  };
  private getDataFromCash(renderer: SpriteRendererType, layerIndex: number) {
    const layer = renderer.layers[layerIndex];
    if (layer.cashedOffsetData) return layer.cashedOffsetData;
    const transform = this.transforms.get(renderer.entityID)!;

    if (!layer.offset) {
      if (renderer.isStatic)
        renderer.layers[layerIndex].cashedOffsetData = {
          x: transform.position.get.x,
          y: transform.position.get.y,
          w: transform.size.get.x,
          h: transform.size.get.y,
        };
      return {
        x: transform.position.get.x,
        y: transform.position.get.y,
        w: transform.size.get.x,
        h: transform.size.get.y,
      };
    }

    const data = {
      x: transform.position.get.x + layer.offset[0],
      y: transform.position.get.y + layer.offset[1],
      w: layer.offset[2],
      h: layer.offset[3],
    };
    if (renderer.isStatic) renderer.layers[layerIndex].cashedOffsetData = data;

    return data;
  }
}
