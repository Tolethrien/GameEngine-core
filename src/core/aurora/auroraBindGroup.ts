import Aurora from "./auroraCore";

interface bindGroupTemplate {
  shaderGroupPosition: number;
  layout: GPUBindGroupLayoutDescriptor;
  data: { entries: Iterable<GPUBindGroupEntry>; label: string };
}
export default class AuroraBindGroup {
  private static groupLayout: GPUBindGroupLayout[] = [];
  /**@description creates bind group and layout from descriptors*/
  public static createBindGroup({
    shaderGroupPosition,
    layout,
    data
  }: bindGroupTemplate): [GPUBindGroup, GPUBindGroupLayout] {
    const layoutOut = Aurora.device.createBindGroupLayout(layout);
    const entriesOut = Aurora.device.createBindGroup({
      entries: data.entries,
      layout: layoutOut,
      label: data.label
    });
    AuroraBindGroup.groupLayout[shaderGroupPosition] = layoutOut;
    return [entriesOut, layoutOut];
  }
  /**@description returns pipeline layout with layouts in order given in bindGroups*/

  public static getPipelineLayout(label: string) {
    return Aurora.device.createPipelineLayout({
      bindGroupLayouts: AuroraBindGroup.groupLayout,
      label: label
    });
  }
}
