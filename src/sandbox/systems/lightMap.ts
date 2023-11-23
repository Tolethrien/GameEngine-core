import { OrthographicCameraType } from "../components/OrthographicCamera";
import { PointLightType } from "../components/pointLight";
import { PositionType } from "../components/position";
import System from "../core/ecs/system";
// import { canvas, ctx, filesObjects } from "../core/engine";

export default class LightMap extends System {
  lightMapCanvas!: OffscreenCanvas;
  lightMapContext!: OffscreenCanvasRenderingContext2D;
  globalIllumination: number;
  camera!: GetExplicitComponent<OrthographicCameraType>;
  pointLights!: GetComponentsList<PointLightType>;
  positions!: GetComponentsList<PositionType>;
  lights!: { [key: string]: HTMLImageElement };
  unitOfIntencity: number;

  constructor(systemProps: SystemProps) {
    super(systemProps);
    this.globalIllumination = 0.9;
    this.unitOfIntencity = 50;
  }
  onStart(): void {
    this.lightMapCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    this.lightMapContext = this.lightMapCanvas.getContext("2d")!;
    this.camera = this.getComponents("orthographicCamera");
    this.camera = this.getEntityComponentByTag("orthographicCamera", "player");
    this.pointLights = this.getComponents("pointLight");
    this.positions = this.getComponents("position");
    this.lights = {
      red: filesObjects.get("redRadialLight") as HTMLImageElement,
      yellow: filesObjects.get("yellowRadialLight") as HTMLImageElement,
      white: filesObjects.get("whiteRadialLight") as HTMLImageElement,
      blue: filesObjects.get("blueRadialLight") as HTMLImageElement
    };
  }

  onUpdate(): void {
    this.lightMapContext.clearRect(0, 0, this.lightMapCanvas.width, this.lightMapCanvas.height);
    this.lightMapContext.globalAlpha = this.globalIllumination;
    this.lightMapContext.globalCompositeOperation = "lighten";
    this.pointLights.forEach((light) => {
      const coords = this.worldToScreen(light.entityID);
      this.lightMapContext.drawImage(
        this.lights[light.color],
        coords.x - light.intencity * (this.unitOfIntencity / 2),
        coords.y - light.intencity * (this.unitOfIntencity / 2),
        light.intencity * this.unitOfIntencity,
        light.intencity * this.unitOfIntencity
      );
    });
    this.lightMapContext.globalCompositeOperation = "destination-atop";
    this.lightMapContext.fillStyle = "rgba(30,30,27,1)";

    this.lightMapContext.fillRect(0, 0, this.lightMapCanvas.width, this.lightMapCanvas.height);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(this.lightMapCanvas, this.camera.position.get.x, this.camera.position.get.y);
  }
  worldToScreen(id: string) {
    return {
      x: (this.positions.get(id)!.vec.get.x - this.camera.position.get.x) / this.camera.zoom,
      y: (this.positions.get(id)!.vec.get.y - this.camera.position.get.y) / this.camera.zoom
    };
  }
}
