import AuroraBuffer from "../../auroraBuffer";
import AuroraPipeline from "../../auroraPipeline";
import AuroraShader from "../../auroraShader";
import AuroraTexture from "../../auroraTexture";
import hisShader from "../shaders/hisShader.wgsl?raw";
import Aurora from "../../auroraCore";
import Batcher from "../batcher";
/**
 * co uwglednic:
 * jak przebudowac system nie przekazywania glyphData
 * przerobienie pikseli na procenty
 *  dodanie mojego stylu vertexowania
 *
 */
export default class HisPipeline {
  private static TEXT_BUFFER_SIZE = 16 * 1000;
  private static vertexBuffer: GPUBuffer;
  private static textBuffer: GPUBuffer;
  private static glyphData: Float32Array = new Float32Array(
    this.TEXT_BUFFER_SIZE
  );

  private static glyphCount = { count: 0 };
  public static createPipeline(): void {
    AuroraPipeline.createVertexBufferLayout("HisVertexLay", {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
      ],
    });
    this.vertexBuffer = AuroraBuffer.createBufferMaped({
      bufferType: "vertex",
      data: [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      label: "HisVertexBuffer",
      type: "Float32Array",
    });
    this.textBuffer = AuroraBuffer.createDynamicBuffer({
      bufferType: "storage",
      label: "HisTextBuffer",
      typedArr: this.glyphData,
    });
    AuroraPipeline.addBindGroup({
      name: "hisTextBind",
      data: {
        label: "HisTextBindData",
        entries: [
          {
            binding: 0,
            resource: { buffer: this.textBuffer },
          },
          {
            binding: 1,
            resource: AuroraTexture.getSampler("linear"),
          },
          {
            binding: 2,
            resource: AuroraTexture.getTexture("roboto").texture.createView(),
          },
        ],
      },
      layout: {
        label: "HisTextBindLayout",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: "read-only-storage" },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
          },
          {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { viewDimension: "2d-array" },
          },
        ],
      },
    });
    AuroraPipeline.createPipelineLayout("HisPipelineLayout", ["hisTextBind"]);
    AuroraShader.addShader("HisShader", hisShader);
    AuroraPipeline.createVertexBufferLayoutGroup("HisBuffersGroupLayout", [
      "HisVertexLay",
    ]);
    AuroraPipeline.createRenderPipeline({
      buffers: AuroraPipeline.getVertexBufferLayoutGroup(
        "HisBuffersGroupLayout"
      ),
      pipelineLayout:
        AuroraPipeline.getRenderPipelineLayout("HisPipelineLayout"),
      pipelineName: "HisPipeline",
      shader: AuroraShader.getSader("HisShader"),
    });

    //=======================================
  }
  public static startPipeline(): void {
    const commandEncoder = Aurora.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: AuroraTexture.getTexture("GUITexture").texture.createView(), //
          clearValue: { r: 1, g: 1, b: 0, a: 0 },
          loadOp: "load",
          storeOp: "store",
        },
      ],
    });

    Aurora.device.queue.writeBuffer(this.textBuffer, 0, this.glyphData);
    AuroraPipeline.getBindsFromLayout("HisPipelineLayout").forEach(
      (bind, index) => {
        renderPass.setBindGroup(index, bind);
      }
    );
    renderPass.setPipeline(AuroraPipeline.getPipeline("HisPipeline"));
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.draw(6, this.glyphCount.count);

    renderPass.end();
    Batcher.getPipelinesInFrame.push(commandEncoder.finish());

    this.glyphCount.count = 0;
    this.glyphData = new Float32Array(this.TEXT_BUFFER_SIZE);
  }
  public static get getGlyphData() {
    return this.glyphData;
  }
  public static get getGlyphCount() {
    return this.glyphCount;
  }
}
