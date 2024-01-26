import System from "../../core/dogma/system";
import { AnimationType } from "../components/animation";
import { SpriteRendererType } from "../components/spriteRenderer";
export default class Animator extends System {
  animations!: GetComponentsList<AnimationType>;
  spriteRenderers!: GetComponentsList<SpriteRendererType>;
  constructor() {
    super();
  }
  onSubscribeList(): void {
    this.animations = this.getComponents("Animation")!;
    this.spriteRenderers = this.getComponents("SpriteRenderer")!;
  }
  onUpdate() {
    this.animations.forEach((animation) => {
      const renderer = this.spriteRenderers.get(animation.entityID);
      if (!renderer || renderer?.type !== "spritesheet") return;
      animation.layerData.forEach((layer) => {
        if (!layer.isAnimate) return;
        if (
          layer.frameCounter >=
          layer.animationSpeed *
            animation.animationData[layer.state].numberOfFrames
        )
          layer.frameCounter = 0;
        layer.frameCounter++;
        if (layer.frameCounter % layer.animationSpeed !== 0) return;
        if (
          layer.frameCounter <
          layer.animationSpeed *
            animation.animationData[layer.state].numberOfFrames
        ) {
          layer.currentFrame++;
          renderer.layers[layer.renderLayerIndex].cashedCropData =
            animation.cashedAnimationData[layer.state][layer.currentFrame];
        } else {
          if (layer.stopOnAnimationFinished) {
            layer.isAnimate = false;
          } else {
            layer.currentFrame = 0;
            renderer.layers[layer.renderLayerIndex].cashedCropData =
              animation.cashedAnimationData[layer.state][layer.currentFrame];
          }
        }
      });
    });
  }
}
