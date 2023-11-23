import Entity from "../core/ecs/entity";
import { SpriteRendererProps } from "../components/spriteRenderer";
import { PositionProps, PositionType } from "../components/position";
import { IndieRigidBodyProps } from "../components/indieRigidBody";
import { SizeProps } from "../components/size";
import { TransformProps } from "../components/transform";
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
  constructor({ pos, size, world, tileList, tileData, groundData, rigid }: TileProps) {
    super(world);
    tileList.push(this.id);
    this.addComponent<TransformProps>("transform", {
      position: pos,
      size: size,
      rotation: 0
    });
    if (rigid) {
      if (rigid === "static-block") {
        this.addComponent<IndieRigidBodyProps>("indieRigidBody", {
          bodyType: "static"
          // friction: 1,
          // mass: 200
        });
      } else {
        this.addComponent<IndieRigidBodyProps>("indieRigidBody", rigid);
      }
    }
    if (groundData) {
      this.addComponent<SpriteRendererProps>("groundRenderer", {
        type: "spritesheet",
        image: "vite",
        GPUAtlas: "char",
        isStatic: true,
        //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
        layers: groundData.map((data) => {
          return {
            crop: { x: data.crop[0] * 32, y: data.crop[1] * 32 },
            cropSize: { width: data.crop[2] * 32, height: data.crop[3] * 32 },
            tint: [data.tint[0], data.tint[1], data.tint[2]],
            alpha: data.tint[3]
          };
        })
      });
    } else {
      this.addComponent<SpriteRendererProps>("groundRenderer", {
        type: "shape",
        isStatic: true,
        tint: [1, 0, 0]
      });
    }
    if (tileData) {
      this.addComponent<SpriteRendererProps>("spriteRenderer", {
        type: "spritesheet",
        image: "vite",
        GPUAtlas: "char",
        isStatic: true,
        //TODO: skoro i tak to jest parsowwanie mozesz podawac po prostu array i obliczac w constructorze
        layers: tileData.map((data) => {
          return {
            crop: { x: data.crop[0] * 32, y: data.crop[1] * 32 },
            offset: data.offset,
            cropSize: { width: data.crop[2] * 32, height: data.crop[3] * 32 },
            tint: [data.tint[0], data.tint[1], data.tint[2]],
            alpha: data.tint[3]
          };
        })
      });
    }
    this.distributeComponents();
  }
}
