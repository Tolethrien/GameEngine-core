import System from "../../core/dogma/system";
import { canvas } from "../../core/engine";
import InputManager, {
  MouseOnEvent,
} from "../../core/modules/inputManager/inputManager";
import NaviCore from "../../core/navigpu/core";
import { MouseEventsType } from "../components/mouseEvents";
import OrthographicCamera from "../components/OrthographicCamera";
import { PlayerInventoryType } from "../components/playerInventory";
import { SpriteRendererType } from "../components/spriteRenderer";
import { TransformType } from "../components/transform";

export default class MouseInputs extends System {
  mouseEvents!: GetComponentsList<MouseEventsType>;
  transforms!: GetComponentsList<TransformType>;
  camera!: GetExplicitComponent<OrthographicCamera>;
  sprite!: GetExplicitComponent<SpriteRendererType>;
  inventory!: GetExplicitComponent<PlayerInventoryType>;
  proximityFilterList: Map<string, TransformType>;
  clearScroll: NodeJS.Timeout | null;
  isMouseClicked: boolean;

  //TODO: system acition zamienic na system invokow, jego plusem jest to ze bedzie dynamiczny wiec komponent bedzie pobierny bezposrednio w moemencie wywolania invoku a nie przypisywany wczesniej do list
  constructor() {
    super();
    this.proximityFilterList = new Map();
    this.clearScroll = null;
    this.isMouseClicked = false;

    NaviCore.Body.addChild("InventoryUI", undefined);
    NaviCore.Body.addChild("HPBar", undefined);
  }
  onSubscribeList(): void {
    this.mouseEvents = this.getComponents("MouseEvents");
    this.transforms = this.getComponents("Transform");
    this.camera = this.getEntityComponentByTag("OrthographicCamera", "player");
    this.sprite = this.getEntityComponentByTag("SpriteRenderer", "player");
    this.inventory = this.getEntityComponentByTag("PlayerInventory", "player");
  }
  onStart(): void {
    InputManager.setMouseCallbacks({
      leftClick: () => this.mouseClickLeft(),
      rightClick: () => this.mouseClickRight(),
      dbClick: () => console.log("DBClick"),
      auxClick: () => console.log("MClick"),
      wheelUp: () => console.log("wheel up"),
      wheelDown: () => console.log("wheel down"),
    });
  }
  MouseWithClick(button: MouseOnEvent) {
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
  mouseClickLeft() {
    if (!NaviCore.useClickedElement("leftClick")) {
      this.MouseWithClick("leftClick");
    }
  }
  mouseClickRight() {
    if (!NaviCore.useClickedElement("rightClick")) {
      // this.MouseWithClick("leftClick");
    }
  }
  proximityFilter(button: MouseOnEvent) {
    const target = Array.from(this.proximityFilterList.values())
      .sort(
        (a, b) =>
          a.position.get.y + a.size.get.y - (b.position.get.y + b.size.get.y)
      )
      .at(-1);
    this.proximityFilterList.clear();
    if (target) {
      this.mouseEvents.get(target.entityID)?.action[button]?.();
    }
    // target && useAction(this.mouseEvents.get(target.entityID)!.action[button]!);
  }

  screenToWorld(mousePos: Position2D) {
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
