import { IndieRigidBodyType } from "../components/indieRigidBody";
import System from "../core/ecs/system";
import { OrthographicCameraType } from "../components/OrthographicCamera";
import AuroraBatcher from "../aurora/auroraBatcher";
import AuroraBindGroup from "../aurora/auroraBindGroup";
import AuroraBuffer from "../aurora/auroraBuffer";
import Aurora from "../aurora/auroraCore";
import { TransformType } from "../components/transform";
import AssetStore from "../core/assetStore";
import { SpriteRendererType } from "../components/spriteRenderer";
import { GroundRendererType } from "../components/groundRenderer";
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
    this.transforms = this.getComponents("transform");
    this.spriteRenderers = this.getComponents("spriteRenderer");
    this.groundRenderers = this.getComponents("groundRenderer");
    this.rigids = this.getComponents("indieRigidBody");
    this.othCam = this.getEntityComponentByTag("orthographicCamera", "player");
    this.createBinds();
    AuroraBatcher.createBatcher({ backgroundColor: [0, 0, 0, 255] });
    console.log(this.spriteRenderers);
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
      { shaderGroup: 1, bindgroup: this.cameraBind }
    ]);
    this.groundRenderers.forEach((ground) => {
      const transform = this.transforms.get(ground.entityID)!;
      ground.layers.forEach((layer) => {
        AuroraBatcher.drawQuad({
          position: {
            x: transform.position.x,
            y: transform.position.y
          },
          size: {
            width: transform.size.x,
            height: transform.size.y
          },
          textureToUse: layer.textureIndex,
          tint: layer.tint,
          alpha: layer.alpha,
          crop: layer.cashedCropData,
          isTexture: layer.isTexture
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
              y: y
            },
            size: {
              width: w,
              height: h
            },
            textureToUse: layer.textureIndex,
            tint: layer.tint,
            alpha: layer.alpha,
            crop: layer.cashedCropData,
            isTexture: layer.isTexture
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
    if (!layer.offset)
      return {
        x: transform.position.get.x,
        y: transform.position.get.y,
        w: transform.size.get.x,
        h: transform.size.get.y
      };

    const data = {
      x: transform.position.get.x + layer.offset[0],
      y: transform.position.get.y + layer.offset[1],
      w: layer.offset[2],
      h: layer.offset[3]
    };
    if (renderer.isStatic) renderer.layers[layerIndex].cashedOffsetData = data;

    return data;
  }

  private createBinds() {
    const [projectionUniform] = AuroraBuffer.createProjectionBuffer(
      this.othCam.projectionViewMatrix,
      {
        writeBufferToGPU: "manual"
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
            buffer: { type: "uniform" }
          }
        ]
      },
      data: {
        label: "camera renderer bind group",
        entries: [{ binding: 0, resource: { buffer: projectionUniform } }]
      }
    });
    const texture = AssetStore.getAsset("GPUAtlas", "char");
    const [texturesBind] = AuroraBindGroup.createBindGroup({
      shaderGroupPosition: 0,
      layout: {
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
          },
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { viewDimension: "2d-array" }
          }
        ]
      },
      data: {
        label: "textures renderer bind group",
        entries: [
          {
            binding: 0,
            resource: texture.sampler
          },
          {
            binding: 1,
            resource: texture.texture.createView()
          }
        ]
      }
    });
    this.cameraBind = cameraBind;
    this.textureBind = texturesBind;
  }
}
