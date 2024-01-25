import { IndieRigidBodyProps } from "../components/indieRigidBody";
import Entity from "../../core/ecs/entity";
export interface TileData {
  crop: number[];
  offset: number[];
  tint: number[];
}
export type GroundData = [number, number, number, number];
export interface TileProps {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  world: string;
  tileList: string[];
  tileData: TileData[] | undefined;
  groundData: GroundData[] | undefined;
  rigid: IndieRigidBodyProps | "static-block" | undefined;
}
export interface TileType extends Tile {}
export default class Tile extends Entity {
  constructor({
    pos,
    size,
    world,
    tileList,
    tileData,
    groundData,
    rigid,
  }: TileProps) {
    super(world);
    tileList.push(this.id);
    this.addComponent("Transform", {
      position: pos,
      size: size,
      rotation: 0,
    });
    if (rigid === "static-block") {
      this.addComponent("IndieRigidBody", {
        bodyType: "static",
      });
    }
    if (groundData) {
      this.addComponent("GroundRenderer", {
        type: "spritesheet",
        GPUAtlas: "userTextureAtlas",
        atlasIndex: 0,
        isStatic: true,
        //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
        layers: groundData.map((data) => {
          return {
            crop: { x: data[0], y: data[1] },
            cropSize: { width: data[2], height: data[3] },
            // tint: [
            //   Math.floor(Math.random() * 255) + 1,
            //   Math.floor(Math.random() * 255) + 1,
            //   Math.floor(Math.random() * 255) + 1,
            // ],
            tint: [255, 255, 255],
            alpha: 255,
            bloom: 0,
          };
        }),
      });
    } else {
      this.addComponent("GroundRenderer", {
        type: "shape",
        isStatic: true,
        tint: [0, 0, 0],
      });
    }
    //2817
    if (tileData) {
      this.addComponent("SpriteRenderer", {
        type: "spritesheet",
        atlasIndex: 0,
        GPUAtlas: "userTextureAtlas",
        isStatic: true,
        //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
        layers: tileData.map((data) => {
          return {
            crop: { x: data.crop[0], y: data.crop[1] },
            cropSize: { width: data.crop[2], height: data.crop[3] },
            offset: {
              x: data.offset[0],
              y: data.offset[1],
              w: data.offset[2],
              h: data.offset[3],
            },
            tint: [255, 255, 255],
            alpha: 255,
          };
        }),
      });
    }
    this.dispatchComponents();
  }
}
