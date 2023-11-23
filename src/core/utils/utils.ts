//=====================================

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
