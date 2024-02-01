import System from "../../core/dogma/system";
import { canvas } from "../../core/engine";
import InputManager from "../../core/modules/inputManager";
import { MouseEventsType } from "../components/mouseEvents";
import OrthographicCamera from "../components/OrthographicCamera";
import { TransformType } from "../components/transform";
type Button = "left" | "right" | "middle";
type mousePosition = { x: number; y: number };
export default class MouseInputs extends System {
  mouseEvents!: GetComponentsList<MouseEventsType>;
  transforms!: GetComponentsList<TransformType>;
  camera!: GetExplicitComponent<OrthographicCamera>;
  proximityFilterList: Map<string, TransformType>;
  clearScroll: NodeJS.Timeout | null;

  constructor() {
    super();
    this.proximityFilterList = new Map();
    this.clearScroll = null;
  }
  onSubscribeList(): void {
    this.mouseEvents = this.getComponents("MouseEvents");
    this.transforms = this.getComponents("Transform");
    this.camera = this.getEntityComponentByTag("OrthographicCamera", "player");
  }
  onUpdate(): void {
    //   if(!InputManager)
  }
  MouseClickWithButton(button: Button) {
    this.mouseEvents.forEach((event) => {
      event.action[button] &&
        this.mouseCollideWithTranslated(event.entityID) &&
        !this.proximityFilterList.has(event.entityID) &&
        this.proximityFilterList.set(
          event.entityID,
          this.transforms.get(event.entityID)!
        );
    });
    this.proximityFilter(button);
  }
  proximityFilter(button: Button) {
    const target = Array.from(this.proximityFilterList.values())
      .sort(
        (a, b) =>
          a.position.get.y + a.size.get.y - (b.position.get.y + b.size.get.y)
      )
      .at(-1);
    this.proximityFilterList.clear();
    // target && useAction(this.mouseEvents.get(target.entityID)!.action[button]!);
  }

  screenToWorld(mousePos: mousePosition) {
    const mouseXNormalized = (mousePos.x / canvas.width) * 2 - 1;
    const mouseYNormalized = -(mousePos.y / canvas.height) * 2 + 1;
    const inverseMatrix = this.camera.projectionViewMatrix.invert();
    const mouseWorldSpace = inverseMatrix.transform([
      mouseXNormalized,
      mouseYNormalized,
      -1,
      1,
    ]);
    return { x: mouseWorldSpace[0], y: mouseWorldSpace[1] };
  }

  mouseCollideWithTranslated(id: EntityType["id"]) {
    const mouseConvertedPosition = InputManager.getTranslatedMousePosition(
      this.camera.projectionViewMatrix
    );
    const transform = this.transforms.get(id)!;

    return (
      Math.floor(mouseConvertedPosition.x) >=
        transform.position.get.x - transform.size.get.x &&
      Math.floor(mouseConvertedPosition.x) <=
        transform.position.get.x + transform.size.get.x &&
      Math.floor(mouseConvertedPosition.y) >=
        transform.position.get.y - transform.size.get.y &&
      Math.floor(mouseConvertedPosition.y) <=
        transform.position.get.y + transform.size.get.y &&
      true
    );
  }
}
