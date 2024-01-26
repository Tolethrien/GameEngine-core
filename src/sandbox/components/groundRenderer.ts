import AuroraTexture from "../../core/aurora/auroraTexture";
import Component from "../../core/dogma/component";
import { clamp } from "../../core/math/math";

interface GeneralProps {
  alpha?: number;
  tint?: [number, number, number];
  offset?: { x: number; y: number; w: number; h: number };
  isStatic: boolean;
  bloom?: number;
}
interface QuadSpriteProps extends GeneralProps {
  type: "sprite";
  atlasIndex: number;
  GPUAtlas: string;
}
interface QuadColorProps extends GeneralProps {
  type: "shape";
}
interface QuadAtlasProps {
  type: "spritesheet";
  atlasIndex: number;
  GPUAtlas: string;
  isStatic: GeneralProps["isStatic"];
  layers: (Omit<GeneralProps, "isStatic"> & {
    cropSize: { width: number; height: number };
    crop: { x: number; y: number };
  })[];
}
interface RendererPassLayer {
  textureIndex: number;
  cashedCropData: Float32Array;
  alpha: number;
  tint: Uint8ClampedArray;
  bloom: number;
  offset?: { x: number; y: number; w: number; h: number };
  isTexture: number;
  cashedOffsetData: { x: number; y: number; w: number; h: number } | undefined;
}
export type GroundRendererProps =
  | QuadAtlasProps
  | QuadColorProps
  | QuadSpriteProps;
export interface GroundRendererType extends GroundRenderer {}
export default class GroundRenderer extends Component {
  type: GroundRendererProps["type"];
  gpuAtlas?: string;
  atlasIndex?: number;
  isStatic: GeneralProps["isStatic"];
  cashedOffsetData: { x: number; y: number; w: number; h: number } | undefined;
  offset: GeneralProps["offset"];
  layers: RendererPassLayer[];
  constructor(componentProps: ComponentProps, props: GroundRendererProps) {
    super(componentProps);
    this.type = props.type;
    this.layers = [];
    this.isStatic = props.isStatic ?? false;
    if (props.type === "shape") {
      this.layers.push({
        cashedCropData: new Float32Array([0, 0, 1, 1]),
        textureIndex: 0,
        alpha: props.alpha !== undefined ? clamp(props.alpha, 0, 255) : 255,
        offset: props.offset ?? undefined,
        tint: new Uint8ClampedArray(props.tint ?? [255, 255, 255]),
        isTexture: 0,
        cashedOffsetData: undefined,
        bloom: props.bloom ?? 0,
      });
    }
    if (props.type === "sprite") {
      this.gpuAtlas = props.GPUAtlas;
      this.atlasIndex = props.atlasIndex;
      // const { index } = AssetStore.getDataFromAtlas(this.gpuAtlas, this.image);
      this.layers.push({
        cashedCropData: new Float32Array([0, 0, 1, 1]),
        textureIndex: this.atlasIndex,
        alpha: props.alpha !== undefined ? clamp(props.alpha, 0, 255) : 255,
        offset: props.offset ?? undefined,
        tint: new Uint8ClampedArray(props.tint ?? [255, 255, 255]),
        isTexture: 1,
        cashedOffsetData: undefined,
        bloom: props.bloom ?? 0,
      });
    }
    if (props.type === "spritesheet") {
      this.atlasIndex = props.atlasIndex;
      this.gpuAtlas = props.GPUAtlas;
      // const { image, index } = AssetStore.getDataFromAtlas(
      //   this.gpuAtlas,
      //   this.image
      // );
      const textureMeta = AuroraTexture.getTexture(this.gpuAtlas)?.meta;
      if (!textureMeta)
        console.error(`no data for texture with label ${this.gpuAtlas}`);
      else
        props.layers.forEach((layer) => {
          const layerCrop = new Float32Array([
            layer.crop.x / textureMeta.width,
            layer.crop.y / textureMeta.height,
            (layer.crop.x + layer.cropSize.width) / textureMeta.width,
            (layer.crop.y + layer.cropSize.height) / textureMeta.height,
          ]);
          this.layers.push({
            cashedCropData: layerCrop,
            textureIndex: this.atlasIndex!,
            alpha: layer.alpha !== undefined ? clamp(layer.alpha, 0, 255) : 255,
            offset: layer.offset ?? undefined,
            tint: new Uint8ClampedArray(layer.tint ?? [255, 255, 255]),
            isTexture: 1,
            cashedOffsetData: undefined,
            bloom: layer.bloom ?? 0,
          });
        });
    }
  }
}
