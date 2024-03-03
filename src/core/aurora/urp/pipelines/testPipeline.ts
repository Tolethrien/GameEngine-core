import AuroraBuffer from "../../auroraBuffer";
import AuroraPipeline from "../../auroraPipeline";
import AuroraShader from "../../auroraShader";
import AuroraTexture from "../../auroraTexture";
import hisShader from "../shaders/his2Shader.wgsl?raw";
import Aurora from "../../auroraCore";
import Batcher from "../batcher";
/**
 * co uwglednic:
 * jak przebudowac system nie przekazywania glyphData
 * przerobienie pikseli na procenty
 *  dodanie mojego stylu vertexowania
 *
 */
export default class His2Pipeline {
  private static TEXT_BUFFER_SIZE = 16 * 1000;
  private static vertexBuffer: GPUBuffer;
  private static textBuffer: GPUBuffer;
  //   private static glyphData: Float32Array = new Float32Array(
  //     this.TEXT_BUFFER_SIZE
  //   );
  private static vertices = new Float32Array(this.TEXT_BUFFER_SIZE);

  private static glyphCount = { count: 0 };
  public static createPipeline(): void {
    AuroraPipeline.createVertexBufferLayout("HisVertexLay", {
      arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
      stepMode: "instance",
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
        {
          shaderLocation: 1,
          offset: 2 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32",
        },
        {
          shaderLocation: 2,
          offset: 3 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32",
        },
        {
          shaderLocation: 3,
          offset: 4 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x4",
        },
        {
          shaderLocation: 4,
          offset: 8 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x2",
        },
        {
          shaderLocation: 5,
          offset: 10 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x4",
        },
        {
          shaderLocation: 6,
          offset: 14 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x2",
        },
      ],
    });
    this.vertexBuffer = AuroraBuffer.createDynamicBuffer({
      bufferType: "vertex",
      label: "HisVertexBuffer",
      typedArr: this.vertices,
    });
    // this.textBuffer = AuroraBuffer.createDynamicBuffer({
    //   bufferType: "storage",
    //   label: "HisTextBuffer",
    //   typedArr: this.glyphData,
    // });
    AuroraPipeline.addBindGroup({
      name: "hisTextBind",
      data: {
        label: "HisTextBindData",
        entries: [
          {
            binding: 0,
            resource: AuroraTexture.getSampler("linear"),
          },
          {
            binding: 1,
            resource: AuroraTexture.getTexture("roboto").texture.createView(),
          },
        ],
      },
      layout: {
        label: "HisTextBindLayout",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
          },
          {
            binding: 1,
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
          clearValue: [1, 1, 0, 1],
          loadOp: "load",
          storeOp: "store",
        },
      ],
    });

    Aurora.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices, 0);
    AuroraPipeline.getBindsFromLayout("HisPipelineLayout").forEach(
      (bind, index) => {
        renderPass.setBindGroup(index, bind);
      }
    );
    renderPass.setPipeline(AuroraPipeline.getPipeline("HisPipeline"));
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(Batcher.getIndexBuffer, "uint32");

    renderPass.drawIndexed(Batcher.getStride.indices, this.glyphCount.count);

    renderPass.end();
    Batcher.getPipelinesInFrame.push(commandEncoder.finish());

    this.glyphCount.count = 0;
    // this.glyphData = new Float32Array(this.TEXT_BUFFER_SIZE);
  }
  public static get getGlyphData() {
    return this.vertices;
  }
  public static get getGlyphCount() {
    return this.glyphCount;
  }
}
