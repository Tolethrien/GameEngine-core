import Component from "../../core/ecs/component";
import { clamp } from "../../core/math/engineMath";
import AssetStore from "../../core/stores/assetStore";

interface GeneralProps {
  alpha?: number;
  tint?: [number, number, number];
  offset?: { x: number; y: number; w: number; h: number };
  isStatic: boolean;
}
interface QuadSpriteProps extends GeneralProps {
  type: "sprite";
  image: string;
  GPUAtlas: string;
}
interface QuadColorProps extends GeneralProps {
  type: "shape";
}
interface QuadAtlasProps {
  type: "spritesheet";
  image: string;
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
  offset?: { x: number; y: number; w: number; h: number };
  isTexture: number;
  cashedOffsetData: { x: number; y: number; w: number; h: number } | undefined;
}
export type SpriteRendererProps =
  | QuadAtlasProps
  | QuadColorProps
  | QuadSpriteProps;

export interface SpriteRendererType extends SpriteRenderer {}
export default class SpriteRenderer extends Component {
  type: SpriteRendererProps["type"];
  image?: string;
  gpuAtlas?: string;
  isStatic: GeneralProps["isStatic"];
  cashedOffsetData: { x: number; y: number; w: number; h: number } | undefined;
  offset: GeneralProps["offset"];
  layers: RendererPassLayer[];
  constructor(componentProps: ComponentProps, props: SpriteRendererProps) {
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
      });
    }
    if (props.type === "sprite") {
      this.image = props.image;
      this.gpuAtlas = props.GPUAtlas;
      const { index } = AssetStore.getDataFromAtlas(this.gpuAtlas, this.image);
      this.layers.push({
        cashedCropData: new Float32Array([0, 0, 1, 1]),
        textureIndex: index,
        alpha: props.alpha !== undefined ? clamp(props.alpha, 0, 255) : 255,
        offset: props.offset ?? undefined,
        tint: new Uint8ClampedArray(props.tint ?? [255, 255, 255]),
        isTexture: 1,
        cashedOffsetData: undefined,
      });
    }
    if (props.type === "spritesheet") {
      this.image = props.image;
      this.gpuAtlas = props.GPUAtlas;
      const { image, index } = AssetStore.getDataFromAtlas(
        this.gpuAtlas,
        this.image
      );
      props.layers.forEach((layer) => {
        const layerCrop = new Float32Array([
          layer.crop.x / image.width,
          layer.crop.y / image.height,
          (layer.crop.x + layer.cropSize.width) / image.width,
          (layer.crop.y + layer.cropSize.height) / image.height,
        ]);
        this.layers.push({
          cashedCropData: layerCrop,
          textureIndex: index,
          alpha: layer.alpha !== undefined ? clamp(layer.alpha, 0, 255) : 255,
          offset: layer.offset ?? undefined,
          tint: new Uint8ClampedArray(layer.tint ?? [255, 255, 255]),
          isTexture: 1,
          cashedOffsetData: undefined,
        });
      });
    }
  }
}
