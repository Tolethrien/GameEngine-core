import Aurora from "./auroraCore";

export default class AuroraShader {
  public static createShader(shaderCode: string, label?: string) {
    return Aurora.device.createShaderModule({
      label: label ?? "generic shader code",
      code: shaderCode
    });
  }
}
