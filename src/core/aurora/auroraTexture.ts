import Aurora from "./auroraCore";

export default class AuroraTexture {
  public static loadedImages: Map<
    string,
    { image: HTMLImageElement; index: number }
  > = new Map();
  public static loadedAtlases: Map<
    string,
    { texture: GPUTexture; sampler: GPUSampler }
  > = new Map();
  /**@description creates GPU texture from url*/
  public static async createTexture(url: string) {
    const image = await AuroraTexture.loadImage(url);

    return await AuroraTexture.createGPUTexture(image);
  }
  /**@description creates GPU texture atlas or texture array, from url's so they can be used in batch*/
  public static async createTextureArray(
    urls: { name: string; url: string }[]
  ) {
    if (urls.length === 0)
      throw new Error("trying to load empty array of images");
    const images: HTMLImageElement[] = [];
    for (const { name, url } of urls) {
      const img = await AuroraTexture.loadImage(url);
      AuroraTexture.loadedImages.set(name, {
        image: img,
        index: AuroraTexture.loadedImages.size,
      });
      images.push(img);
    }
    const texture = await AuroraTexture.createGPUTextureAtlas(images);
    AuroraTexture.loadedAtlases.set(
      `GPUTextureAtlasIndex:${AuroraTexture.loadedAtlases.size}`,
      texture
    );
    return texture;
  }
  private static async loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolved, rejected) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        resolved(image);
      };
      image.onerror = (err) => {
        rejected(err);
      };
    });
  }
  private static async createGPUTextureAtlas(images: HTMLImageElement[]) {
    /**TODO: fix - every texture need to be same size */
    const texture = Aurora.device.createTexture({
      format: "rgba8unorm",
      size: {
        width: images[0].width,
        height: images[0].height,
        depthOrArrayLayers: images.length,
      },
      dimension: "2d",
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const datas: ImageBitmap[] = [];
    for (const image of images) {
      datas.push(await createImageBitmap(image));
    }
    datas.forEach((data, index) => {
      Aurora.device.queue.copyExternalImageToTexture(
        { source: data },
        { texture: texture, origin: { z: index } },
        {
          width: images[0].width,
          height: images[0].height,
        }
      );
    });
    const sampler = Aurora.device.createSampler();
    return { texture, sampler };
  }
  private static async createGPUTexture(image: HTMLImageElement) {
    const texture = Aurora.device.createTexture({
      format: "rgba8unorm",
      size: {
        width: image.width,
        height: image.height,
      },
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const data = await createImageBitmap(image);
    Aurora.device.queue.copyExternalImageToTexture(
      { source: data },
      { texture: texture },
      {
        width: image.width,
        height: image.height,
      }
    );

    const sampler = Aurora.device.createSampler();
    return { texture, sampler };
  }
}
