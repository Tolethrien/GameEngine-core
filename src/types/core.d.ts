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
  type AvalibleComponents = Omit<typeof avalibleComponents, "CoreComponent">;
  type AvalibleSystems = Omit<typeof avalibleSystems, "CoreSystem">;
  type AvalibleSystemsGroups = Omit<
    typeof avalibleSystemsGroups,
    "CoreGroupSystem"
  >;
  type GetComponentsList<T> = Map<string, T>;
  type GetExplicitComponent<T> = Required<T>;
  type SystemProps = { name: string; shared?: Map<string, unknown> };
  interface Vec2DType extends Vec2D {}
  interface ComponentType extends Component {}
  interface SystemType extends System {}
  interface SystemsGroupType extends SystemsGroup {}
  interface WorldType extends World {}
  interface EntityType extends Entity {}
  type EntitiesManipulatedInFrame = { added: string[]; removed: string[] };
  type SystemInitType<T> = Record<string, new (props: SystemProps) => T>;

  interface ComponentProps {
    entityID: string;
    entityTags: string[];
  }
}
