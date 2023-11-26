import AssetStore from "../../core/stores/assetStore";
import Component from "../../core/ecs/component";

interface AnimationData {
  [key: string]: {
    numberOfFrames: number;
    rowInSpritesheet: number;
    startAnimation?: boolean;
  };
}
type CashedFrame = Record<number, Float32Array>;
export interface AnimationProps {
  isAnimate?: boolean;
  stopOnAnimationFinished?: boolean;
  state: string;
  animationSpeed: number;
  animationData: AnimationData;
  spriteSheet: { gpuAtlas: string; image: string };
  cropSize: { width: number; height: number };
}
export interface AnimationType extends Animation {}
export default class Animation extends Component {
  frameCounter: number;
  animationSpeed: number;
  isAnimate: boolean;
  state: string;
  stopOnAnimationFinished: boolean;
  animationData: AnimationData;
  currentFrame: number;
  cropSize: { width: number; height: number };
  spriteSheet: { gpuAtlas: string; image: string };

  cashedAnimationData: {
    [key: string]: CashedFrame;
  };

  constructor(
    componentProps: ComponentProps,
    {
      state = "idle",
      isAnimate = false,
      stopOnAnimationFinished = false,
      animationSpeed = 8,
      cropSize = { width: 32, height: 32 },
      animationData = {},
      spriteSheet,
    }: AnimationProps
  ) {
    super(componentProps);
    this.frameCounter = 0;
    this.animationSpeed = animationSpeed;
    this.isAnimate = isAnimate;
    this.state = state;
    this.currentFrame = 0;
    this.cropSize = cropSize;
    this.stopOnAnimationFinished = stopOnAnimationFinished;
    this.animationData = animationData;
    this.spriteSheet = spriteSheet;
    this.cashedAnimationData = this.createCashedAnimData();
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
}
