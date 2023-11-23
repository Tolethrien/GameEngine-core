import Vec2D from "../core/math/vec2D";
import System from "../core/ecs/system";
import SystemsGroup from "../core/ecs/systemsGroup";
import World from "../core/ecs/world";
import Entity from "../core/ecs/entity";
import {
  avalibleComponents,
  avalibleSystems,
  avalibleSystemsGroups,
} from "../sandbox/ECSList";
import Component from "../core/ecs/component";
declare global {
  type AvalibleComponents = typeof avalibleComponents;
  type avalibleSystems = typeof avalibleSystems;
  type avalibleSystemsGroups = typeof avalibleSystemsGroups;
  type GetComponentsList<T> = Map<string, T>;
  type GetExplicitComponent<T> = Required<T>;
  type SystemProps = { name: string; shared?: Map<string, unknown> };
  interface Vec2DType extends Vec2D {}
  interface ComponentType extends Component {}
  interface SystemType extends System {}
  interface SystemsGroupType extends SystemsGroup {}
  interface WorldType extends World {}
  interface EntityType extends Entity {}
  interface ComponentProps {
    entityID: string;
    entityTags: string[];
  }
}
