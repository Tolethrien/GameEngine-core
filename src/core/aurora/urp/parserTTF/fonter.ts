import { Lookups } from "./parserTypes";

export default class Fonter {
  private static loadedFonts = new Map<string, Lookups>();
  public static addFont(fontName: string, table: Lookups) {
    this.loadedFonts.set(fontName, table);
  }
  public static getFontLUT(fontName: string) {
    return this.loadedFonts.get(fontName);
  }
}
