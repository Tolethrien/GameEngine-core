import AuroraTexture from "../../core/aurora/auroraTexture";
import Component from "../../core/dogma/component";

interface AnimationData {
  [key: string]: {
    numberOfFrames: number;
    rowInSpritesheet: number;
    startAnimation?: boolean;
  };
}
interface LayerDataProps {
  renderLayerIndex: number;
  isAnimate?: boolean;
  stopOnAnimationFinished?: boolean;
  state: string;
  animationSpeed: number;
}
interface LayerData {
  frameCounter: number;
  currentFrame: number;
}

type CashedFrame = Record<number, Float32Array>;
export interface AnimationProps {
  animationData: AnimationData;
  layers: LayerDataProps[];
  spriteSheet: { gpuAtlas: string; atlasIndex: number };
  cropSize: { width: number; height: number };
}
export interface AnimationType extends Animation {}
export default class Animation extends Component {
  // frameCounter: number;
  animationData: AnimationData;
  // currentFrame: number;
  cropSize: { width: number; height: number };
  spriteSheet: { gpuAtlas: string; atlasIndex: number };
  cashedAnimationData: {
    [key: string]: CashedFrame;
  };
  layerData: (LayerData & LayerDataProps)[];

  constructor(
    componentProps: ComponentProps,
    {
      cropSize = { width: 32, height: 32 },
      animationData = {},
      layers = [],
      spriteSheet,
    }: AnimationProps
  ) {
    super(componentProps);
    this.cropSize = cropSize;
    this.animationData = animationData;
    this.spriteSheet = spriteSheet;
    this.cashedAnimationData = this.createCashedAnimData();
    this.layerData = this.createLayerData(layers);
  }
  private createCashedAnimData() {
    // const { image } = AssetStore.getDataFromAtlas(
    //   this.spriteSheet.gpuAtlas,
    //   this.spriteSheet.image
    // );
    const data: Record<string, CashedFrame> = {};
    const textureMeta = AuroraTexture.getTexture(
      this.spriteSheet.gpuAtlas
    )?.meta;
    if (!textureMeta)
      console.error(
        `no data for texture with label ${this.spriteSheet.gpuAtlas}`
      );
    else {
      for (const animState in this.animationData) {
        const { numberOfFrames, rowInSpritesheet } =
          this.animationData[animState];
        const frames: CashedFrame = {};
        Array(numberOfFrames)
          .fill(null)
          .forEach((_, index) => {
            frames[index] = new Float32Array([
              (index * this.cropSize.width) / textureMeta.width,
              ((rowInSpritesheet - 1) * this.cropSize.height) /
                textureMeta.height,
              (index * this.cropSize.width + this.cropSize.width) /
                textureMeta.width,
              ((rowInSpritesheet - 1) * this.cropSize.height +
                this.cropSize.height) /
                textureMeta.height,
            ]);
          });
        data[animState] = frames;
      }
    }
    return data;
  }
  private createLayerData(layers: LayerDataProps[]) {
    const layerData: (LayerData & LayerDataProps)[] = [];
    layers.forEach((layer) => {
      layerData.push({ ...layer, frameCounter: 0, currentFrame: 0 });
    });

    return layerData;
  }
}
