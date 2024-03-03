import Vec2D from "../../math/vec2D";
import Vec4D from "../../math/vec4D";
import { validateValue } from "../../utils/utils";
import Aurora from "../auroraCore";
import AuroraTexture from "../auroraTexture";
import Batcher from "./batcher";
import Fonter from "./parserTTF/fonter";
import { getTextShape } from "./parserTTF/shapeText";
import GUIPipeline from "./pipelines/guiPipeline";
import HisPipeline from "./pipelines/hisPipeline";
import LightsPipeline from "./pipelines/lightsPipeline";
import OffscreenPipeline from "./pipelines/offscreenPipeline";
import His2Pipeline from "./pipelines/testPipeline";
/**
 * PLAN:
 * zbudowac pipeline dzialajacy na jego kodzie
 * przerobic go na moj pipeline
 * polaczyc go z poim draw pipelinem
 */
interface SpriteProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  textureToUse: number;
  crop: Float32Array;
  tint: Uint8ClampedArray;
  alpha: number;
  isTexture: number;
  bloom: number;
}
interface LightProps {
  type: keyof typeof LightsPipeline.getLightTypes;
  position: { x: number; y: number };
  size: { width: number; height: number };
  tint: [number, number, number];
  intensity: number;
}
interface TextProps {
  position: { x: number; y: number };
  weight: number;
  textureToUse: number;
  color: Uint8ClampedArray;
  alpha: number;
  bloom: number;
  text: string;
}
interface GUIProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  textureToUse: number;
  crop: Float32Array;
  tint: Uint8ClampedArray;
  alpha: number;
  isTexture: number;
}
interface GUITextProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  textureToUse: number;
  crop: Float32Array;
  tint: Uint8ClampedArray;
  alpha: number;
  isTexture: number;
  text: string;
  weight: number;
}
//TODO: zmien index textury moze na jakis string czy cos by bylo latwiej niz myslec jaki index to co
export default class Draw {
  public static Quad({
    position,
    size,
    textureToUse,
    crop,
    alpha,
    tint,
    isTexture,
    bloom,
  }: SpriteProps) {
    const vertices = OffscreenPipeline.getVertices;
    const addData = OffscreenPipeline.getAddData;
    const quadsData = Batcher.getRenderData;
    const quadsTotal = quadsData.numberOfQuads.game;
    const stride = Batcher.getStride;
    vertices[quadsTotal * stride.vertices] = position.x;
    vertices[quadsTotal * stride.vertices + 1] = position.y;
    vertices[quadsTotal * stride.vertices + 2] = size.width;
    vertices[quadsTotal * stride.vertices + 3] = size.height;
    vertices[quadsTotal * stride.vertices + 4] = crop[0];
    vertices[quadsTotal * stride.vertices + 5] = crop[1];
    vertices[quadsTotal * stride.vertices + 6] = crop[2];
    vertices[quadsTotal * stride.vertices + 7] = crop[3];
    addData[quadsTotal * stride.gameAddData] = tint[0];
    addData[quadsTotal * stride.gameAddData + 1] = tint[1];
    addData[quadsTotal * stride.gameAddData + 2] = tint[2];
    addData[quadsTotal * stride.gameAddData + 3] = alpha;
    addData[quadsTotal * stride.gameAddData + 4] = textureToUse;
    addData[quadsTotal * stride.gameAddData + 5] = isTexture;
    addData[quadsTotal * stride.gameAddData + 6] = 0;
    addData[quadsTotal * stride.gameAddData + 7] = bloom;
    quadsData.numberOfQuads.total++;
    quadsData.numberOfQuads.game++;
  }
  public static Light({ intensity, position, size, tint, type }: LightProps) {
    const lights = LightsPipeline.getLightsData;
    const lightsTotal = Batcher.getRenderData.numberOfLights;
    const stride = Batcher.getStride;
    const lightTypes = LightsPipeline.getLightTypes;
    lights[(1 + lightsTotal) * stride.lights] = position.x;
    lights[(1 + lightsTotal) * stride.lights + 1] = position.y;
    lights[(1 + lightsTotal) * stride.lights + 2] = size.width;
    lights[(1 + lightsTotal) * stride.lights + 3] = size.height;
    lights[(1 + lightsTotal) * stride.lights + 4] = tint[0];
    lights[(1 + lightsTotal) * stride.lights + 5] = tint[1];
    lights[(1 + lightsTotal) * stride.lights + 6] = tint[2];
    lights[(1 + lightsTotal) * stride.lights + 7] = intensity;
    lights[(1 + lightsTotal) * stride.lights + 8] = lightTypes[type];
    Batcher.getRenderData.numberOfLights++;
  }
  public static Text({
    alpha,
    bloom,
    color,
    position,
    textureToUse,
    weight,
    text,
  }: TextProps) {
    //TODO: znormalizowac jesli renderujesz UI
    let xPos = position.x;
    const { height: imgHeight, width: imgWidth } =
      AuroraTexture.getTexture("fontRoboto").meta;
    const vertices = OffscreenPipeline.getVertices;
    const addData = OffscreenPipeline.getAddData;
    const quadsData = Batcher.getRenderData;
    const stride = Batcher.getStride;
    const renderGui = false;
    Array.from(text).forEach((char) => {
      const quadsTotal = quadsData.numberOfQuads.game;
      const glyph = Batcher.getFontData[char.charCodeAt(0)];
      let width, height, advence, offsetY;
      if (renderGui) {
        width = (glyph.width * weight) / Aurora.canvas.width;
        height = (glyph.height * weight) / Aurora.canvas.height;
        advence = (glyph.xadvance * weight) / Aurora.canvas.width;
        offsetY = (glyph.yoffset * weight) / Aurora.canvas.height;
      } else {
        width = glyph.width * weight;
        height = glyph.height * weight;
        advence = glyph.xadvance * weight;
        offsetY = glyph.yoffset * weight;
      }
      vertices[quadsTotal * stride.vertices] = xPos + width / 2;
      vertices[quadsTotal * stride.vertices + 1] =
        position.y + height / 2 + (renderGui ? 0 : offsetY);
      vertices[quadsTotal * stride.vertices + 2] = width / 2;
      vertices[quadsTotal * stride.vertices + 3] = height / 2;
      vertices[quadsTotal * stride.vertices + 4] = glyph.x / imgWidth;
      vertices[quadsTotal * stride.vertices + 5] = glyph.y / imgHeight;
      vertices[quadsTotal * stride.vertices + 6] =
        glyph.x / imgWidth + glyph.width / imgWidth;
      vertices[quadsTotal * stride.vertices + 7] =
        glyph.y / imgHeight + glyph.height / imgHeight;
      addData[quadsTotal * stride.gameAddData] = color[0];
      addData[quadsTotal * stride.gameAddData + 1] = color[1];
      addData[quadsTotal * stride.gameAddData + 2] = color[2];
      addData[quadsTotal * stride.gameAddData + 3] = alpha;
      addData[quadsTotal * stride.gameAddData + 4] = textureToUse;
      addData[quadsTotal * stride.gameAddData + 5] = 0;
      addData[quadsTotal * stride.gameAddData + 6] = 1;
      addData[quadsTotal * stride.gameAddData + 7] = bloom;
      quadsData.numberOfQuads.total++;
      renderGui
        ? quadsData.numberOfQuads.gui++
        : quadsData.numberOfQuads.game++;
      xPos += advence;
    });
  }
  public static GUI({
    alpha,
    crop,
    isTexture,
    position,
    size,
    textureToUse,
    tint,
  }: GUIProps) {
    const vertices = GUIPipeline.getVertices;
    const addData = GUIPipeline.getAddData;
    const quadsData = Batcher.getRenderData;
    const quadsTotal = quadsData.numberOfQuads.gui;
    const stride = Batcher.getStride;
    vertices[quadsTotal * stride.vertices] = position.x;
    vertices[quadsTotal * stride.vertices + 1] = position.y;
    vertices[quadsTotal * stride.vertices + 2] = size.width;
    vertices[quadsTotal * stride.vertices + 3] = size.height;
    vertices[quadsTotal * stride.vertices + 4] = crop[0];
    vertices[quadsTotal * stride.vertices + 5] = crop[1];
    vertices[quadsTotal * stride.vertices + 6] = crop[2];
    vertices[quadsTotal * stride.vertices + 7] = crop[3];
    addData[quadsTotal * stride.guiAddData] = tint[0];
    addData[quadsTotal * stride.guiAddData + 1] = tint[1];
    addData[quadsTotal * stride.guiAddData + 2] = tint[2];
    addData[quadsTotal * stride.guiAddData + 3] = alpha;
    addData[quadsTotal * stride.guiAddData + 4] = textureToUse;
    addData[quadsTotal * stride.guiAddData + 5] = isTexture;
    addData[quadsTotal * stride.guiAddData + 6] = 0;
    quadsData.numberOfQuads.total++;
    quadsData.numberOfQuads.gui++;
  }
  public static text(
    text: string,
    position: Vec2D,
    fontSize: number,
    color: Vec4D
  ): void {
    const lut = Fonter.getFontLUT("roboto");
    validateValue(lut, "Font must be set.");
    const shape = getTextShape(lut, text, fontSize);
    // console.log(shape);
    const glyphData = His2Pipeline.getGlyphData;
    const glyphCount = His2Pipeline.getGlyphCount;
    const struct = 16;
    for (let i = 0; i < shape.positions.length; i++) {
      const shapePosition = shape.positions[i].add(position);
      const size = shape.sizes[i];
      // console.log(size);
      const uv = lut.uvs.get(text[i].charCodeAt(0));
      // console.log(color);
      validateValue(uv, "UV does not exist.");
      //posX
      //posY
      //width
      //height
      //uvx
      //uvy
      //uvw
      //uvh
      //tint1
      //tint2
      //tint3
      //alpha
      glyphData[glyphCount.count * struct + 0] = shapePosition.x;
      glyphData[glyphCount.count * struct + 1] = shapePosition.y;
      glyphData[glyphCount.count * struct + 2] = 0;
      glyphData[glyphCount.count * struct + 3] = fontSize;
      glyphData[glyphCount.count * struct + 4] = color.x;
      glyphData[glyphCount.count * struct + 5] = color.y;
      glyphData[glyphCount.count * struct + 6] = color.z;
      glyphData[glyphCount.count * struct + 7] = color.w;
      glyphData[glyphCount.count * struct + 8] = size.x;
      glyphData[glyphCount.count * struct + 9] = size.y;
      glyphData[glyphCount.count * struct + 10] = uv.x;
      glyphData[glyphCount.count * struct + 11] = uv.y;
      glyphData[glyphCount.count * struct + 12] = uv.x + uv.z;
      glyphData[glyphCount.count * struct + 13] = uv.y + uv.w;
      glyphData[glyphCount.count * struct + 14] = window.innerWidth;
      glyphData[glyphCount.count * struct + 15] = window.innerHeight;

      glyphCount.count += 1;
    }
  }
  // public static GUIText({
  //   alpha,
  //   crop,
  //   isTexture,
  //   position,
  //   size,
  //   textureToUse,
  //   tint,
  //   text,
  //   weight,
  // }: GUITextProps) {
  //   let xPos = position.x;
  //   const { height: imgHeight, width: imgWidth } =
  //     AuroraTexture.getTexture("fontRoboto").meta;
  //   const vertices = GUIPipeline.getVertices;
  //   const addData = GUIPipeline.getAddData;
  //   const quadsData = Batcher.getRenderData;
  //   const stride = Batcher.getStride;
  //   Array.from(text).forEach((char) => {
  //     // console.log(char);
  //     const quadsTotal = quadsData.numberOfQuads.gui;

  //     const glyph = Batcher.getFontData[char.charCodeAt(0)];
  //     let width, height, advence, offsetY;
  //     width = (glyph.width * weight) / Aurora.canvas.width;
  //     height = (glyph.height * weight) / Aurora.canvas.height;
  //     advence = (glyph.xadvance * weight) / Aurora.canvas.width;
  //     offsetY = (glyph.yoffset * weight) / Aurora.canvas.height;
  //     vertices[quadsTotal * stride.vertices] = xPos;
  //     vertices[quadsTotal * stride.vertices + 1] = position.y;
  //     vertices[quadsTotal * stride.vertices + 2] = 1;
  //     vertices[quadsTotal * stride.vertices + 3] = 1.5;
  //     vertices[quadsTotal * stride.vertices + 4] = glyph.x / imgWidth;
  //     vertices[quadsTotal * stride.vertices + 5] = glyph.y / imgHeight;
  //     vertices[quadsTotal * stride.vertices + 6] =
  //       glyph.x / imgWidth + glyph.width / imgWidth;
  //     vertices[quadsTotal * stride.vertices + 7] =
  //       glyph.y / imgHeight + glyph.height / imgHeight;
  //     addData[quadsTotal * stride.guiAddData] = tint[0];
  //     addData[quadsTotal * stride.guiAddData + 1] = tint[1];
  //     addData[quadsTotal * stride.guiAddData + 2] = tint[2];
  //     addData[quadsTotal * stride.guiAddData + 3] = alpha;
  //     addData[quadsTotal * stride.guiAddData + 4] = textureToUse;
  //     addData[quadsTotal * stride.guiAddData + 5] = 1;
  //     addData[quadsTotal * stride.guiAddData + 6] = 1;
  //     quadsData.numberOfQuads.total++;
  //     quadsData.numberOfQuads.gui++;
  //     xPos += advence;
  //   });
  // }
}
