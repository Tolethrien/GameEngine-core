import CoreComponent from "../core/dogma/abstracts/coreComponent";
import CoreSystem from "../core/dogma/abstracts/coreSystem";
import OrthographicCamera from "./components/OrthographicCamera";
import SpriteRenderer from "./components/spriteRenderer";
import Animation from "./components/animation";
import IndieRigidBody from "./components/indieRigidBody";
import GroundRenderer from "./components/groundRenderer";
import MouseEvents from "./components/mouseEvents";
import PointLight from "./components/pointLight";
import Transform from "./components/transform";
import KeyInputs from "./systems/keyInputs";
import Cameras from "./systems/camera";
import Animator from "./systems/animator";
import LoadChunks from "./systems/loadChunks";
import MouseInputs from "./systems/mouseInputs";
import IndiePhysics from "./systems/indiePhysics";
import TempSystem from "../core/dogma/tempSystem";
import Renderer from "./systems/renderer";
export const avalibleComponents = {
  CoreComponent, // required
  Transform,
  SpriteRenderer,
  OrthographicCamera,
  Animation,
  IndieRigidBody,
  GroundRenderer,
  MouseEvents,
  PointLight,
} as const;
export const avalibleSystems = {
  CoreSystem, // required
  Renderer,
  KeyInputs,
  Cameras,
  Animator,
  LoadChunks,
  MouseInputs,
  IndiePhysics,
  TempSystem,
} as const;
