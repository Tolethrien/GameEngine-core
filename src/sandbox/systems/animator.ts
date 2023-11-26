import System from "../../core/ecs/system";
import { AnimationType } from "../components/animation";
import { SpriteRendererType } from "../components/spriteRenderer";
export default class Animator extends System {
  animations!: GetComponentsList<AnimationType>;
  spriteRenderers!: GetComponentsList<SpriteRendererType>;
  constructor(list: SystemProps) {
    super(list);
  }
  onStart() {
    this.animations = this.getComponents("Animation");
    this.spriteRenderers = this.getComponents("SpriteRenderer");
  }
  onUpdate() {
    this.animations.forEach((animation) => {
      if (this.spriteRenderers.get(animation.entityID)?.type !== "spritesheet")
        return;
      if (animation.isAnimate && this.spriteRenderers.has(animation.entityID)) {
        if (
          animation.frameCounter >=
          animation.animationSpeed *
            animation.animationData[animation.state].numberOfFrames
        ) {
          animation.frameCounter = 0;
        }
        animation.frameCounter++;
        if (animation.frameCounter % animation.animationSpeed === 0) {
          // console.log(animation.frameCounter);
          if (
            animation.frameCounter <
            animation.animationSpeed *
              animation.animationData[animation.state].numberOfFrames
          ) {
            animation.currentFrame++;
            //TODO: animacja teraz nie dziala bo dodales layery wiec cashed jest w nim a nie globalny
            this.spriteRenderers.get(animation.entityID)!.cashedCropData =
              animation.cashedAnimationData[animation.state][
                animation.currentFrame
              ];
          } else {
            animation.stopOnAnimationFinished
              ? (animation.isAnimate = false)
              : ((animation.currentFrame = 0),
                (this.spriteRenderers.get(animation.entityID)!.cashedCropData =
                  animation.cashedAnimationData[animation.state][
                    animation.currentFrame
                  ]));
          }
        }
      }
    });
  }
}
