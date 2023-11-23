import Aurora from "./auroraCore";

export default class AuroraRenderer {
  /**@description creates render pipeline layout, it takes GPU bind groups layout's, and returns pipeline layout. order of list is important!*/
  public static createRenderPipelineLayout(bindGroups: GPUBindGroupLayout[], label?: string) {
    return Aurora.device.createPipelineLayout({
      bindGroupLayouts: [...bindGroups],
      label: label ?? "generic render pipeline layout"
    });
  }
  /**@description creates render pipeline*/
  public static createRenderPipeline(descriptor: GPURenderPipelineDescriptor) {
    return Aurora.device.createRenderPipeline(descriptor);
  }
  /**@description builtin teplates for color target state */
  public static getColorTargetTemplate(type: "standard"): GPUColorTargetState {
    switch (type) {
      case "standard":
        return {
          format: navigator.gpu.getPreferredCanvasFormat(),
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add"
            },
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add"
            }
          }
        };
    }
  }
}
