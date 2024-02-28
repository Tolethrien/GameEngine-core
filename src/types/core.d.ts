import Vec2D from "../core/math/vec2D";
import {
  NaviUINodes,
  avalibleComponents,
  avalibleSystems,
} from "../sandbox/ECSList";
import Component from "../core/dogma/component";
import Entity from "../core/dogma/entity";
import System from "../core/dogma/system";
import World from "../core/dogma/world";
import NaviNode from "../core/navigpu/node";
declare global {
  type AvalibleComponents = Omit<typeof avalibleComponents, "CoreComponent">;
  type AvalibleSystems = Omit<typeof avalibleSystems, "CoreSystem">;
  type AvalibleUINodes = typeof NaviUINodes;

  type GetComponentsList<T> = Map<string, T>;
  type GetExplicitComponent<T> = Required<T>;
  interface Vec2DType extends Vec2D {}
  interface ComponentType extends Component {}
  interface SystemType extends System {}
  interface WorldType extends World {}
  interface EntityType extends Entity {}
  type Position2D = { x: number; y: number };
  type Size2D = { width: number; height: number };
  type RGB = [number, number, number];
  type RGBA = [number, number, number, number];
  interface ComponentProps {
    entityID: string;
    entityTags: string[];
  }
  interface NaviNodeProps {
    parent: NaviNode | undefined;
    layer: number;
  }

  interface MapSchema {
    MAP_INFO: {
      mapName: string;
      sizes: {
        map: {
          InTiles: { width: number; height: number; total: number };
          InChunks: { width: number; height: number; total: number };
          inPixels: { width: number; height: number; total: number };
        };
        chunk: {
          InTiles: { width: number; height: number; total: number };
          inPixels: { width: number; height: number; total: number };
        };
        tile: {
          width: number;
          height: number;
        };
      };
    };
    TILESET_LUT: {
      grounds: {
        [key: string]: {
          pos: number[];
          collider: (boolean | number)[];
        };
      };
      tiles: {
        [key: string]: {
          crop: number[];
          offset: number[];
          collider: (boolean | number)[];
          tint: number[];
          name: string;
        };
      };
    };
  }
}
