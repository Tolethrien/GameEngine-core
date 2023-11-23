import OrthographicCamera from "../../components/OrthographicCamera";
import SpriteRenderer from "../../components/spriteRenderer";
import GroundRenderer from "../../components/groundRenderer";
import Cameras from "../../systems/camera";
import KeyInputs from "../../systems/keyInputs";
import Renderer from "../../systems/renderer";
import Animation from "../../components/animation";
import Animator from "../../systems/animator";
import IndieRigidBody from "../../components/indieRigidBody";
import LoadChunks from "../../systems/loadChunks";
import MouseInputs from "../../systems/mouseInputs";
import MouseEvents from "../../components/mouseEvents";
import IndiePhysics from "../../systems/indiePhysics";
import LightMap from "../../systems/lightMap";
import PointLight from "../../components/pointLight";
import Transform from "../../components/transform";
export const avalibleComponents = {
  SpriteRenderer,
  OrthographicCamera,
  Animation,
  IndieRigidBody,
  GroundRenderer,
  MouseEvents,
  PointLight,
  Transform
} as const;
export const avalibleSystems = {
  Renderer,
  KeyInputs,
  Cameras,
  Animator,
  LoadChunks,
  MouseInputs,
  IndiePhysics,
  LightMap
} as const;
export const avalibleSystemsGroups = {} as const;
