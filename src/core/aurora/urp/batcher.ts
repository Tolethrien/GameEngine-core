import { clamp, normalizeColor } from "../../math/math";
import AuroraCamera from "./auroraCamera";
import Aurora from "../auroraCore";
import AuroraTexture from "../auroraTexture";
import BloomPipeline from "./pipelines/bloomPipeline";
import CompositePipeline from "./pipelines/compositePipeline";
import LayeredTestPipeline from "./pipelines/layeredTestPipeline";
import LightsPipeline from "./pipelines/lightsPipeline";
import OffscreenPipeline from "./pipelines/offscreenPipeline";
import PresentationPipeline, {
  ScreenEffects,
} from "./pipelines/presentationPipeline";
import TresholdPipeline from "./pipelines/tresholdPipeline";
import radialL from "../../../assets/lights/radial.png";
import AuroraBuffer from "../auroraBuffer";
import AuroraPipeline from "../auroraPipeline";
import { WARNINGS } from "./warnings";
import GUIPipeline from "./pipelines/guiPipeline";
import { parseTTF } from "./parserTTF/parse";
import { createGlyphLUT } from "./parserTTF/glyphLUT";
import { createGlyphAtlas } from "./parserTTF/glyphAtlas";
import Fonter from "./parserTTF/fonter";
import HisPipeline from "./pipelines/hisPipeline";
import His2Pipeline from "./pipelines/testPipeline";
import PresentGuiPipeline from "./pipelines/presentGuiPipeline";
interface RenderData {
  numberOfQuads: {
    total: number;
    game: number;
    gui: number;
  };
  numberOfLights: number;
  limits: {
    quadsPerFrame: number;
    lightsPerFrame: number;
    guiPerFrame: number;
  };
  drawCallsInFrame: {
    render: number;
    compute: number;
  };
  colorCorrection: number[];
  backgroundColor: number[];
  customCamera: boolean;
  bloom: { active: boolean; str: number };
  lighting: boolean;
  screenShader: { type: ScreenEffects; str: number };
}
interface BatcherOptions {
  backgroundColor: number[];
  maxQuadPerSceen: number;
  maxLightsPerSceen: number;
  maxGuiPerSceen: number;
  customCamera: boolean;
  bloom: { active: boolean; str: number };
  lighting: boolean;
}
interface Stride {
  vertices: number;
  gameAddData: number;
  guiAddData: number;
  indices: number;
  lights: number;
}

export interface GlyphSchema {
  width: number;
  height: number;
  x: number;
  y: number;
  xadvance: number;
  yoffset: number;
  xoffset: number;
  id: number;
}
export default class Batcher {
  private static renderData: RenderData = {
    drawCallsInFrame: { compute: 0, render: 0 },
    limits: { lightsPerFrame: 100, quadsPerFrame: 10000, guiPerFrame: 1000 },
    numberOfLights: 0,
    numberOfQuads: { game: 0, gui: 0, total: 0 },
    backgroundColor: [0, 0, 0, 255],
    colorCorrection: [255, 255, 255],
    customCamera: false,
    bloom: { active: true, str: 16 },
    lighting: true,
    screenShader: { type: "none", str: 0 },
  };
  private static stride: Stride = {
    vertices: 8,
    gameAddData: 8,
    guiAddData: 8,
    indices: 6,
    lights: 9,
  };

  private static pipelinesInFrame: GPUCommandBuffer[] = [];
  private static testMode = false;
  private static fontData: Record<number, Omit<GlyphSchema, "id">> = {};

  private static projectionBuffer: GPUBuffer;
  private static customcameraMatrix = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);
  private static indexBuffer: GPUBuffer;
  public static async createBatcher(options?: Partial<BatcherOptions>) {
    //TODO: zmienic by user sam wybieral nazwe tego
    !AuroraTexture.getStore.has("userTextureAtlas") &&
      console.error(WARNINGS.TEXTURE_WARNING);
    this.indexBuffer = AuroraBuffer.createBufferMaped({
      data: [0, 1, 2, 1, 2, 3],
      bufferType: "index",
      type: "Uint32Array",
      label: "offscreenIndexBuffer",
    });
    this.setOptions(options);
    await this.createBatcherTextures();
    this.createCamera();
    OffscreenPipeline.createPipeline();
    TresholdPipeline.createPipeline();
    BloomPipeline.createPipeline();
    LightsPipeline.createPipeline();
    CompositePipeline.createPipeline();
    GUIPipeline.createPipeline();
    if (this.testMode) LayeredTestPipeline.createPipeline();
    else {
      PresentationPipeline.createPipeline();
      PresentGuiPipeline.createPipeline();
    }
  }
  public static get getRenderData() {
    return this.renderData;
  }
  public static get getStride() {
    return this.stride;
  }
  public static get getPipelinesInFrame() {
    return this.pipelinesInFrame;
  }
  public static get getIndexBuffer() {
    return this.indexBuffer;
  }
  public static get getFontData() {
    return this.fontData;
  }
  private static setOptions(options?: Partial<BatcherOptions>) {
    //TODO: zmienic to na nie takie łopatologiczne
    if (!options) return;
    if (options.backgroundColor)
      this.renderData.backgroundColor = normalizeColor(options.backgroundColor);
    if (options.customCamera) this.renderData.customCamera = true;
    else AuroraCamera.initialize();
    if (options.maxGuiPerSceen)
      this.renderData.limits.guiPerFrame = options.maxGuiPerSceen;
    if (options.bloom) this.renderData.bloom = options.bloom;
    if (options.lighting) this.renderData.lighting = true;
    if (options.maxQuadPerSceen)
      this.renderData.limits.quadsPerFrame = options.maxQuadPerSceen;
    if (options.maxLightsPerSceen)
      this.renderData.limits.lightsPerFrame = options.maxLightsPerSceen;
  }
  private static async createBatcherTextures() {
    AuroraTexture.createSampler("universal");
    AuroraTexture.createSampler("linear", {
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      mipmapFilter: "linear",
    });

    await AuroraTexture.createTextureArray({
      label: "lightsList",
      urls: [radialL, radialL],
    });

    AuroraTexture.createEmptyTexture({
      label: "offscreenTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "offscreenTextureFloat",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
      format: "rgba16float",
    });
    AuroraTexture.createEmptyTexture({
      label: "treshholdTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "lightsTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "GUITexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "bloomPassOneTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "bloomPassTwoTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
    AuroraTexture.createEmptyTexture({
      label: "compositeTexture",
      size: {
        width: Aurora.canvas.width,
        height: Aurora.canvas.height,
      },
    });
  }
  private static createCamera() {
    this.projectionBuffer = AuroraBuffer.createDynamicBuffer({
      bufferType: "uniform",
      typedArr: this.renderData.customCamera
        ? this.customcameraMatrix
        : AuroraCamera.getProjectionViewMatrix.getMatrix,
      label: "CameraBuffer",
    });
    AuroraPipeline.addBindGroup({
      name: "cameraBind",
      layout: {
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: "uniform" },
          },
        ],
        label: "cameraBindLayout",
      },
      data: {
        label: "cameraBindData",
        entries: [{ binding: 0, resource: { buffer: this.projectionBuffer } }],
      },
    });
  }
  public static async loadFont(font: string) {
    const name = font.split("/").at(-1)!.split(".")[0];
    const fontFile = await fetch(font).then((result) => result.arrayBuffer());
    const ttf = parseTTF(fontFile);
    const lookups = createGlyphLUT(ttf);
    const fontAtlas = await createGlyphAtlas(lookups, fontFile, {
      useSDF: true,
    });
    //TODO: dodawac do listy textur fontow a nie tworzyc jedna texture
    AuroraTexture.createTextureFromBitMap({
      label: name,
      bitmap: fontAtlas,
    });
    Fonter.addFont(name, lookups);
  }

  public static startBatch() {
    this.renderData.numberOfQuads = {
      game: 0,
      gui: 0,
      total: 0,
    };
    this.renderData.numberOfLights = 0;
    this.pipelinesInFrame = [];
    !this.renderData.customCamera && AuroraCamera.update();
  }
  public static endBatch() {
    this.renderData.drawCallsInFrame = { compute: 0, render: 0 };
    Aurora.device.queue.writeBuffer(
      this.projectionBuffer,
      0,
      this.renderData.customCamera
        ? this.customcameraMatrix
        : AuroraCamera.getProjectionViewMatrix.getMatrix
    );
    OffscreenPipeline.startPipeline();
    TresholdPipeline.startPipeline();
    BloomPipeline.startPipeline();
    LightsPipeline.startPipeline();
    CompositePipeline.startPipeline();
    GUIPipeline.startPipeline();
    if (this.testMode) LayeredTestPipeline.startPipeline();
    else {
      PresentationPipeline.startPipeline();
      PresentGuiPipeline.startPipeline();
    }
    Aurora.device.queue.submit(this.pipelinesInFrame);
  }
  public static setScreenShader(effect: ScreenEffects, intesity?: number) {
    if (this.testMode) {
      const data = LayeredTestPipeline.getGlobalEffectData;
      const effectList = LayeredTestPipeline.getEffectList;
      data[0] = effectList[effect];
      this.renderData.screenShader.type = effect;
      if (intesity) {
        data[1] = clamp(intesity, 0, 1);
        this.renderData.screenShader.str = intesity;
      }
    } else {
      const data = PresentationPipeline.getGlobalEffectData;
      const effectList = PresentationPipeline.getEffectList;
      data[0] = effectList[effect];
      this.renderData.screenShader.type = effect;
      if (intesity) {
        data[1] = clamp(intesity, 0, 1);
        this.renderData.screenShader.str = intesity;
      }
    }
  }
  public static setGlobalColorCorrection(color: [number, number, number]) {
    this.renderData.colorCorrection = color;
  }
  public static setBloom(active: boolean, strength?: number) {
    this.renderData.bloom.active = active;
    strength && (this.renderData.bloom.str = clamp(strength, 0, 50));
    CompositePipeline.getCompositeData[1] = active ? 1 : 0;
  }
  public static setLights(active: boolean) {
    this.renderData.lighting = active;
    CompositePipeline.getCompositeData[0] = active ? 1 : 0;
  }
  public static setCameraBuffer(matrix: Float32Array) {
    this.customcameraMatrix = matrix;
  }
}
