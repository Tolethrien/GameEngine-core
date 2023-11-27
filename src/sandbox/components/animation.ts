import AssetStore from "../../core/stores/assetStore";
import Component from "../../core/ecs/component";

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
  spriteSheet: { gpuAtlas: string; image: string };
  cropSize: { width: number; height: number };
}
export interface AnimationType extends Animation {}
export default class Animation extends Component {
  // frameCounter: number;
  animationData: AnimationData;
  // currentFrame: number;
  cropSize: { width: number; height: number };
  spriteSheet: { gpuAtlas: string; image: string };
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
    console.log(this.cashedAnimationData, this.layerData);
  }
  private createCashedAnimData() {
    const { image } = AssetStore.getDataFromAtlas(
      this.spriteSheet.gpuAtlas,
      this.spriteSheet.image
    );
    const data: Record<string, CashedFrame> = {};
    for (const animState in this.animationData) {
      const { numberOfFrames, rowInSpritesheet } =
        this.animationData[animState];
      const frames: CashedFrame = {};
      Array(numberOfFrames)
        .fill(null)
        .forEach((_, index) => {
          frames[index] = new Float32Array([
            (index * this.cropSize.width) / image.width,
            ((rowInSpritesheet - 1) * this.cropSize.height) / image.height,
            (index * this.cropSize.width + this.cropSize.width) / image.width,
            ((rowInSpritesheet - 1) * this.cropSize.height +
              this.cropSize.height) /
              image.height,
          ]);
        });
      data[animState] = frames;
    }
    return data;
  }
  private createLayerData(layers: LayerDataProps[]) {
    const layerData: (LayerData & LayerDataProps)[] = [];
    layers.forEach((layer) => {
      console.log(layer);
      layerData.push({ ...layer, frameCounter: 0, currentFrame: 0 });
    });

    return layerData;
  }
}
