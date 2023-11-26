import Aurora from "../aurora/auroraCore";
interface AssetsStore {
  sound: Map<string, typetype["sound"]>;
  image: Map<string, typetype["image"]>;
  GPUTexture: Map<string, typetype["GPUTexture"]>;
  GPUTextureAtlas: Map<string, typetype["GPUTextureAtlas"]>;
}
type GPUAtlasDataReturn = {
  name: string;
  image: HTMLImageElement;
  index: number;
};
type AssetsTypes = "sound" | "image" | "GPUTexture" | "GPUTextureAtlas";
interface typetype {
  sound: HTMLAudioElement;
  image: HTMLImageElement;
  GPUTexture: {
    image: HTMLImageElement;
    texture: GPUTexture;
    sampler: GPUSampler;
  };
  GPUTextureAtlas: {
    texture: GPUTexture;
    sampler: GPUSampler;
    data: { name: string; image: HTMLImageElement; index: number }[];
  };
}
type AssetTypeMap = {
  sound: typetype["sound"];
  image: typetype["image"];
  GPUTexture: typetype["GPUTexture"];
  GPUTextureAtlas: typetype["GPUTextureAtlas"];
};
export default class AssetStore {
  private static store: AssetsStore = {
    sound: new Map(),
    GPUTexture: new Map(),
    GPUTextureAtlas: new Map(),
    image: new Map(),
  };
  static getAsset<T extends AssetsTypes>(
    assetType: T,
    name: string
  ): AssetTypeMap[T] {
    let asset;
    switch (assetType) {
      case "image":
        asset = AssetStore.store.image.get(name);
        break;
      case "sound":
        asset = AssetStore.store.sound.get(name);
        break;
      case "GPUTextureAtlas":
        asset = AssetStore.store.GPUTextureAtlas.get(name);
        break;
      case "GPUTexture":
        asset = AssetStore.store.GPUTexture.get(name);
        break;
      default:
        throw new Error(`no type of ${assetType} in Store`);
    }
    if (!asset)
      throw new Error(
        `Error occur trying to load asset "${name}", in Store.${assetType}. Asset not found`
      );
    return asset as AssetTypeMap[T];
  }
  static get getStore() {
    return AssetStore.store;
  }
  static getDataFromAtlas(atlasName: string, imageName: string) {
    const data = AssetStore.store.GPUTextureAtlas.get(atlasName)?.data;
    if (!data)
      throw new Error(
        `Error: atlas name "${atlasName}" is not found in store.GPUAtlas`
      );
    const found = data.find((element) => element.name === imageName);
    if (!found)
      throw new Error(
        `Error: image "${imageName}" is not found in atlas "${atlasName}"`
      );
    return found;
  }
  static removeAsset(assetType: AssetsTypes, name: string) {
    AssetStore.store[assetType].delete(name);
  }
  static async addImage(name: string, url: string) {
    const img = await AssetStore.loadImg(url);
    AssetStore.store.image.set(name, img);
    return img;
  }

  static async addGPUAtlas(
    atlasName: string,
    atlasData: { url: string; name: string }[]
  ): Promise<[GPUTexture, GPUSampler, GPUAtlasDataReturn[]]> {
    if (atlasData.length === 0)
      throw new Error("trying to load empty array of images");
    const data: GPUAtlasDataReturn[] = [];
    let index = 0;
    for (const { name, url } of atlasData) {
      const img = await AssetStore.loadImg(url);
      data.push({ image: img, index, name });
      index++;
    }
    const images = data.map((item) => item.image);
    const { sampler, texture } = await AssetStore.createGPUTextureAtlas(images);
    AssetStore.store.GPUTextureAtlas.set(atlasName, { sampler, texture, data });
    return [texture, sampler, data];
  }
  static async addSound(name: string, url: string) {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.onloadeddata = () => {
        AssetStore.store.sound.set(name, audio);
        resolve(audio);
      };
      audio.onerror = (error) => {
        reject(error);
      };
    });
  }
  static async addGPUTexture(name: string, url: string) {
    const image = await AssetStore.loadImg(url);
    const { sampler, texture } = await AssetStore.createGPUTexture(image);
    AssetStore.store.GPUTexture.set(name, { image, texture, sampler });
  }
  private static async loadImg(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        resolve(image);
      };
      image.onerror = (error) => {
        reject(error);
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
