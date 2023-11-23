import OrthographicCamera from "./components/OrthographicCamera";
import SpriteRenderer from "./components/spriteRenderer";
import Animation from "./components/animation";
import IndieRigidBody from "./components/indieRigidBody";
import GroundRenderer from "./components/groundRenderer";
import MouseEvents from "./components/mouseEvents";
import PointLight from "./components/pointLight";
import Transform from "./components/transform";
import KeyInputs from "./systems/keyInputs";
import Renderer from "./systems/renderer";
import Cameras from "./systems/camera";
import Animator from "./systems/animator";
import LoadChunks from "./systems/loadChunks";
import MouseInputs from "./systems/mouseInputs";
import IndiePhysics from "./systems/indiePhysics";
export const avalibleComponents = {
  SpriteRenderer,
  OrthographicCamera,
  Animation,
  IndieRigidBody,
  GroundRenderer,
  MouseEvents,
  PointLight,
  Transform,
} as const;
export const avalibleSystems = {
  Renderer,
  KeyInputs,
  Cameras,
  Animator,
  LoadChunks,
  MouseInputs,
  IndiePhysics,
} as const;
export const avalibleSystemsGroups = {} as const;
