import { IndieRigidBodyProps } from "../components/indieRigidBody";
import Entity from "../../core/ecs/entity";
interface TileData {
  crop: [number, number, number, number];
  offset: { x: number; y: number; w: number; h: number };
  tint: [number, number, number, number];
}
interface GroundData {
  crop: [number, number, number, number];
  tint: [number, number, number, number];
}
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
        image: "vite",
        GPUAtlas: "char",
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
            tint: [rigid === "static-block" ? 0 : 255, 255, 255],
            alpha: 255,
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
    if (tileData) {
      this.addComponent("SpriteRenderer", {
        type: "spritesheet",
        image: "vite",
        GPUAtlas: "char",
        isStatic: true,
        //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
        layers: tileData.map((data) => {
          return {
            crop: { x: data[0], y: data[1] },
            offset: [data[4], data[5], data[6], data[7]],
            cropSize: { width: data[2], height: data[3] },
            tint: [255, 255, 55],
            alpha: 255,
          };
        }),
      });
    }
    this.distributeComponents();
  }
}
