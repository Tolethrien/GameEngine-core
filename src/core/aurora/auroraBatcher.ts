import Aurora from "./auroraCore";
import AuroraBindGroup from "./auroraBindGroup";
import AuroraRenderer from "./auroraRenderer";
import AuroraShader from "./auroraShader";
import universalShader from "./shaders/universalShader.wgsl?raw";
import { normalizeColor } from "../utils/utils";
interface SpriteProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  textureToUse: number;
  crop: Float32Array;
  tint: Uint8ClampedArray;
  alpha: number;
  isTexture: number;
}
type BindGroupsData = { shaderGroup: number; bindgroup: GPUBindGroup }[];
type BatcherOptions = typeof OPTIONS_TEMPLATE;
const OPTIONS_TEMPLATE = {
  backgroundColor: [0, 0, 0, 255],
  maxQuadPerBatch: 100000,
};
const MAX_NUMBER_OF_QUADS_PER_BATCH = OPTIONS_TEMPLATE.maxQuadPerBatch;
const VERTEX_ATT_COUNT = 8;
const ADDDATA_ATT_COUNT = 6;
const INDICIES_PER_QUAD = 6;

export default class AuroraBatcher {
  public static numberOfQuadsInBatch = 0;
  private static vertexBuffer: GPUBuffer;
  private static indexBuffer: GPUBuffer;
  private static addDataBuffer: GPUBuffer;
  private static bindGroupsData: BindGroupsData;
  private static pipeline: GPURenderPipeline;
  public static vertices: Float32Array;
  public static addData: Uint32Array;
  private static options: BatcherOptions;

  public static createBatcher(options?: BatcherOptions) {
    AuroraBatcher.options = AuroraBatcher.setOptions(options);
    AuroraBatcher.createBuffersTypedArrays();
    AuroraBatcher.createBatchBuffers();
    AuroraBatcher.createPipeline();
  }
  public static setBindGroups(bindGroups: BindGroupsData) {
    AuroraBatcher.bindGroupsData = bindGroups;
  }
  public static startBatch() {
    AuroraBatcher.numberOfQuadsInBatch = 0;
  }
  public static endBatch() {
    const encoder = Aurora.device.createCommandEncoder();
    const commandPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: Aurora.context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: AuroraBatcher.options.backgroundColor,
        },
      ],
    });
    Aurora.device.queue.writeBuffer(
      AuroraBatcher.vertexBuffer,
      0,
      AuroraBatcher.vertices
    );
    Aurora.device.queue.writeBuffer(
      AuroraBatcher.addDataBuffer,
      0,
      AuroraBatcher.addData
    );
    AuroraBatcher.bindGroupsData.forEach((bind) => {
      commandPass.setBindGroup(bind.shaderGroup, bind.bindgroup);
    });
    commandPass.setPipeline(AuroraBatcher.pipeline);
    commandPass.setVertexBuffer(0, AuroraBatcher.vertexBuffer);
    commandPass.setVertexBuffer(1, AuroraBatcher.addDataBuffer);
    commandPass.setIndexBuffer(this.indexBuffer, "uint32");
    commandPass.drawIndexed(
      INDICIES_PER_QUAD,
      AuroraBatcher.numberOfQuadsInBatch
    );
    commandPass.end();
    Aurora.device.queue.submit([encoder.finish()]);
  }

  public static drawQuad({
    position,
    size,
    textureToUse,
    crop,
    alpha,
    tint,
    isTexture,
  }: SpriteProps) {
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT
    ] = position.x;
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 1
    ] = position.y;
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 2
    ] = size.width;
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 3
    ] = size.height;
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 4
    ] = crop[0];
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 5
    ] = crop[1];
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 6
    ] = crop[2];
    AuroraBatcher.vertices[
      AuroraBatcher.numberOfQuadsInBatch * VERTEX_ATT_COUNT + 7
    ] = crop[3];
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT
    ] = tint[0];
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT + 1
    ] = tint[1];
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT + 2
    ] = tint[2];
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT + 3
    ] = alpha;
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT + 4
    ] = textureToUse;
    AuroraBatcher.addData[
      AuroraBatcher.numberOfQuadsInBatch * ADDDATA_ATT_COUNT + 5
    ] = isTexture;
    AuroraBatcher.numberOfQuadsInBatch++;
  }

  private static createBatchBuffers() {
    AuroraBatcher.vertexBuffer = Aurora.device.createBuffer({
      label: "batch renderer vertex buffer",
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    AuroraBatcher.addDataBuffer = Aurora.device.createBuffer({
      label: "batch renderer vertex buffer",
      size: this.addData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    AuroraBatcher.indexBuffer = Aurora.device.createBuffer({
      label: "batch renderer vertex buffer",
      size: Uint32Array.BYTES_PER_ELEMENT * INDICIES_PER_QUAD,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });
    new Uint32Array(this.indexBuffer.getMappedRange()).set([0, 1, 2, 1, 2, 3]);
    this.indexBuffer.unmap();
  }
  private static createBuffersTypedArrays() {
    this.vertices = new Float32Array(
      MAX_NUMBER_OF_QUADS_PER_BATCH * VERTEX_ATT_COUNT
    );
    this.addData = new Uint32Array(
      MAX_NUMBER_OF_QUADS_PER_BATCH * ADDDATA_ATT_COUNT
    );
  }
  private static createPipeline() {
    const shader = AuroraShader.createShader(universalShader, "shader shader");
    //TODO: rozkminic liczenie długosci strida ktory ma i floaty i uinty i polaczyc buffery w jeden
    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 8 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: "instance",
      attributes: [
        {
          format: "float32x2",
          offset: 0,
          shaderLocation: 0, // Position, see vertex shader
        },
        {
          format: "float32x2",
          offset: 2 * Float32Array.BYTES_PER_ELEMENT,
          shaderLocation: 1, // size, see vertex shader
        },
        {
          format: "float32x4",
          offset: 4 * Float32Array.BYTES_PER_ELEMENT,
          shaderLocation: 2, // crop, see vertex shader
        },
      ],
    };
    const addDataBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 6 * Uint32Array.BYTES_PER_ELEMENT,
      stepMode: "instance",
      attributes: [
        {
          format: "uint32x4",
          offset: 0,
          shaderLocation: 3, // color, see vertex shader
        },
        {
          format: "uint32",
          offset: 4 * Uint32Array.BYTES_PER_ELEMENT,
          shaderLocation: 4, // textureIndex, see vertex shader
        },
        {
          format: "uint32",
          offset: 5 * Uint32Array.BYTES_PER_ELEMENT,
          shaderLocation: 5, // isTextureOrColor, see vertex shader
        },
      ],
    };
    AuroraBatcher.pipeline = AuroraRenderer.createRenderPipeline({
      label: "batch pipeline",
      layout: AuroraBindGroup.getPipelineLayout("renderpipelay"),
      vertex: {
        module: shader,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout, addDataBufferLayout],
      },
      fragment: {
        module: shader,
        entryPoint: "fragmentMain",
        targets: [AuroraRenderer.getColorTargetTemplate("standard")],
      },
    });
  }
  private static setOptions(options?: BatcherOptions) {
    const template = { ...OPTIONS_TEMPLATE, ...options };
    template.backgroundColor = normalizeColor(template.backgroundColor);
    return template;
  }
}
