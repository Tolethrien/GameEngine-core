import { IndieRigidBodyType } from "../components/indieRigidBody";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import { TransformType } from "../components/transform";
import { SpriteRendererType } from "../components/spriteRenderer";
import { GroundRendererType } from "../components/groundRenderer";
import System from "../../core/ecs/system";
import AuroraBatcher from "../../core/aurora/auroraBatcher";
import Aurora from "../../core/aurora/auroraCore";
import AuroraBuffer from "../../core/aurora/auroraBuffer";
import AuroraBindGroup from "../../core/aurora/auroraBindGroup";
import AssetStore from "../../core/stores/assetStore";
import RenderFrame from "../../core/debugger/renderStats/renderFrame";
export default class Renderer extends System {
  transforms!: GetComponentsList<TransformType>;
  spriteRenderers!: GetComponentsList<SpriteRendererType>;
  groundRenderers!: GetComponentsList<GroundRendererType>;
  rigids!: GetComponentsList<IndieRigidBodyType>;
  othCam!: GetExplicitComponent<OrthographicCameraType>;
  textureBind!: GPUBindGroup;
  cameraBind!: GPUBindGroup;
  projectionUniform!: GPUBuffer;
  constructor(props: SystemProps) {
    super(props);
  }
  onStart() {
    this.transforms = this.getComponents("Transform");
    this.spriteRenderers = this.getComponents("SpriteRenderer");
    this.groundRenderers = this.getComponents("GroundRenderer");
    this.rigids = this.getComponents("IndieRigidBody");
    this.othCam = this.getEntityComponentByTag("OrthographicCamera", "player");
    this.createBinds();
    AuroraBatcher.createBatcher({
      backgroundColor: [255, 0, 255, 255],
      maxQuadPerBatch: 10000,
    });
  }
  onUpdate() {
    AuroraBatcher.startBatch();
    Aurora.device.queue.writeBuffer(
      this.projectionUniform,
      0,
      this.othCam.projectionViewMatrix.getMatrix
    );
    AuroraBatcher.setBindGroups([
      { shaderGroup: 0, bindgroup: this.textureBind },
      { shaderGroup: 1, bindgroup: this.cameraBind },
    ]);
    this.groundRenderers?.forEach((ground) => {
      const transform = this.transforms.get(ground.entityID)!;
      ground.layers.forEach((layer) => {
        //TODO: blad gdzie na poczatku gry masz skos 5ms na kilka sekund by potem zniknac
        // wystepuje tutaj w drawQuadzie z jakiegos powodu i tylko przy ruchu postaci
        // pomimo iz ten draw sie wykonuje non stop pred ruchem postaci i nie ma problemu wczesniej!
        // im szybciej sie rusze tym mniejszy czas czekania na poprawe, jak sie rusze odrazu to sie nie dzieje

        AuroraBatcher.drawQuad({
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
        });
      });
    });
    Array.from(this.spriteRenderers.values())
      .sort(this.sortByPositionY)
      .forEach((renderer) => {
        renderer.layers.forEach((layer, index) => {
          const { h, w, x, y } = this.getDataFromCash(renderer, index);
          AuroraBatcher.drawQuad({
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
          });
        });
      });

    // AuroraBatcher.drawQuad({
    //   position: {
    //     x: canvas.width / 2,
    //     y: canvas.height / 2
    //   },
    //   size: {
    //     height: 4,
    //     width: 4
    //   },
    //   textureToUse: 0,
    //   tint: new Uint8ClampedArray([255, 255, 0]),
    //   alpha: 255,
    //   crop: new Float32Array([0, 0, 0, 0]),
    //   isTexture: 0
    // });
    RenderFrame.swapToGPU();
    RenderFrame.setQuadCount(AuroraBatcher.numberOfQuadsInBatch);
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

  private createBinds() {
    const [projectionUniform] = AuroraBuffer.createProjectionBuffer(
      this.othCam.projectionViewMatrix,
      {
        writeBufferToGPU: "manual",
      }
    );
    this.projectionUniform = projectionUniform;
    const [cameraBind] = AuroraBindGroup.createBindGroup({
      shaderGroupPosition: 1,
      layout: {
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: "uniform" },
          },
        ],
      },
      data: {
        label: "camera renderer bind group",
        entries: [{ binding: 0, resource: { buffer: projectionUniform } }],
      },
    });
    const texture = AssetStore.getAsset("GPUTextureAtlas", "char");
    const [texturesBind] = AuroraBindGroup.createBindGroup({
      shaderGroupPosition: 0,
      layout: {
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
          },
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { viewDimension: "2d-array" },
          },
        ],
      },
      data: {
        label: "textures renderer bind group",
        entries: [
          {
            binding: 0,
            resource: texture.sampler,
          },
          {
            binding: 1,
            resource: texture.texture.createView(),
          },
        ],
      },
    });
    this.cameraBind = cameraBind;
    this.textureBind = texturesBind;
  }
}
