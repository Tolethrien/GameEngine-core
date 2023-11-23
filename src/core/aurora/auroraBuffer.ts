import Mat4 from "../math/mat4";
import Aurora from "./auroraCore";
type AuroraStringifytypedArray =
  | "Float32Array"
  | "Float64Array"
  | "Uint16Array"
  | "Uint32Array"
  | "Uint8Array";

interface AuroraBufferOptions {
  type: AuroraStringifytypedArray;
  writeBufferToGPU?: "write" | "manual";
  label?: string;
  mapedAtCreation?: boolean;
}
type AuroraBufferReturnType = [
  GPUBuffer,
  Float32Array | Float64Array | Uint16Array | Uint32Array | Uint8Array
];
export default class AuroraBuffer {
  /**@description Creates vertex buffer, it can be written do device automaticly on create or manualy when you need to modify data on every frame */
  public static createVertexBuffer(
    vertices: number[],
    options: AuroraBufferOptions
  ): AuroraBufferReturnType {
    const shouldWrite = options.writeBufferToGPU === "write" ? true : false;
    const vertexData = this.chooseTypedArray(options.type, vertices);
    const maped = options.mapedAtCreation ?? false;
    const usage = maped ? GPUBufferUsage.STORAGE : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
    const vertexBuffer = Aurora.device.createBuffer({
      label: options.label ?? "generic vertex buffer",
      size: vertexData.byteLength,
      usage: usage
    });
    shouldWrite && !maped && Aurora.device.queue.writeBuffer(vertexBuffer, 0, vertexData);
    maped && this.mapBuffer(options.type, vertexBuffer, vertices);

    return [vertexBuffer, vertexData];
  }
  /**@description Creates index buffer, it can be written do device automaticly on create or manualy when you need to modify data on every frame */
  public static createIndexBuffer(
    indexes: number[],
    options: AuroraBufferOptions
  ): AuroraBufferReturnType {
    const shouldWrite = options.writeBufferToGPU === "write" ? true : false;
    const maped = options.mapedAtCreation ?? false;
    const indexData = this.chooseTypedArray(options.type, indexes);
    const usage = maped ? GPUBufferUsage.INDEX : GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;
    const indexBuffer = Aurora.device.createBuffer({
      label: options.label ?? "generic storage buffer",
      size: indexData.byteLength,
      usage: usage,
      mappedAtCreation: maped
    });
    shouldWrite && !maped && Aurora.device.queue.writeBuffer(indexBuffer, 0, indexData);
    maped && this.mapBuffer(options.type, indexBuffer, indexes);
    return [indexBuffer, indexData];
  }
  /**@description Creates Storage buffer, it can be written do device automaticly on create or manualy when you need to modify data on every frame */
  public static createStorageBuffer(
    storage: number[],
    options: AuroraBufferOptions
  ): AuroraBufferReturnType {
    const shouldWrite = options.writeBufferToGPU === "write" ? true : false;
    const maped = options.mapedAtCreation ?? false;
    const storageData = this.chooseTypedArray(options.type, storage);
    const usage = maped ? GPUBufferUsage.STORAGE : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
    const storageBuffer = Aurora.device.createBuffer({
      label: options.label ?? "generic storage buffer",
      size: storageData.byteLength,
      usage: usage
    });
    shouldWrite && Aurora.device.queue.writeBuffer(storageBuffer, 0, storageData);
    maped && this.mapBuffer(options.type, storageBuffer, storage);

    return [storageBuffer, storageData];
  }
  /**@description Creates uniform buffer, it can be written do device automaticly on create or manualy when you need to modify data on every frame */
  public static createUniformBuffer(
    uniform: number[],
    options: AuroraBufferOptions
  ): AuroraBufferReturnType {
    const shouldWrite = options.writeBufferToGPU === "write" ? true : false;
    const maped = options.mapedAtCreation ?? false;
    const uniformData = this.chooseTypedArray(options.type, uniform);
    const usage = maped ? GPUBufferUsage.UNIFORM : GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    const uniformBuffer = Aurora.device.createBuffer({
      label: options.label ?? "generic uniform buffer",
      size: uniformData.byteLength,
      usage: usage
    });
    shouldWrite && Aurora.device.queue.writeBuffer(uniformBuffer, 0, uniformData);
    maped && this.mapBuffer(options.type, uniformBuffer, uniform);

    return [uniformBuffer, uniformData];
  }
  /**@description Creates Projection buffer which is type of Uniform buffer specify for camera and matrix uses, it can be written do device automaticly on create or manualy when you need to modify data on every frame */
  public static createProjectionBuffer(
    projection: Mat4,
    options: Omit<AuroraBufferOptions, "type">
  ): AuroraBufferReturnType {
    const projectionData = projection.getMatrix;
    const shouldWrite = options.writeBufferToGPU === "write" ? true : false;
    const maped = options.mapedAtCreation ?? false;
    const usage = maped ? GPUBufferUsage.UNIFORM : GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    const projectionBuffer = Aurora.device.createBuffer({
      label: options.label ?? "generic projection buffer",
      size: projectionData.byteLength,
      usage: usage
    });
    shouldWrite && !maped && Aurora.device.queue.writeBuffer(projectionBuffer, 0, projectionData);
    maped && this.mapBuffer("Float32Array", projectionBuffer, [...projection.getMatrix]);

    return [projectionBuffer, projectionData];
  }
  private static chooseTypedArray(typed: AuroraStringifytypedArray, data: number[] | ArrayBuffer) {
    switch (typed) {
      case "Float32Array":
        return new Float32Array(data);
      case "Float64Array":
        return new Float64Array(data);
      case "Uint16Array":
        return new Uint16Array(data);
      case "Uint32Array":
        return new Uint32Array(data);
      case "Uint8Array":
        return new Uint8Array(data);
      default:
        return new Float32Array(data);
    }
  }
  private static mapBuffer(typed: AuroraStringifytypedArray, buffer: GPUBuffer, data: number[]) {
    this.chooseTypedArray(typed, buffer.getMappedRange()).set(data);
    buffer.unmap();
  }
}
