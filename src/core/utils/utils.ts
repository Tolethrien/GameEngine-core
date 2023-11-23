import { filesObjects } from "../core/engine";

//=====================================

/**
 * @description loadImage is adding loaded image to the game file list, and also returns this image if you want to assigned it
 */
export const loadImage = async (name: string, url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      console.log("loaded");
      filesObjects.set(name, image);
      resolve(image);
    };
    image.onerror = (error) => {
      reject(error);
    };
  });
};
export const loadSound = async (name: string, url: string) => {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.onloadeddata = () => {
      console.log("loaded sound");
      filesObjects.set(name, audio);
      resolve(audio);
    };
    audio.onerror = (error) => {
      reject(error);
    };
  });
};

//=====================================
export const createRandomShortString = () =>
  "_" + Math.random().toString(36).substring(2, 9);
//=====================================
export const nameToUpper = (name: string) =>
  [name[0].toUpperCase(), name.slice(1)].toString().replace(",", "");
//=====================================
export const loadFont = () => {
  return new FontFace("test", "url(x)");
};
//=====================================
export const normalizeColor = (color: [number, number, number, number]) =>
  color.map((value) => value / 255);
