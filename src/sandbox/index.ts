import mapFile from "./test.json";
import tilemap from "../assets/tilemap3.png";
import char from "../assets/char.png";
import Engine from "../core/engine";
import Player from "./entities/player";
import AssetStore from "../core/stores/assetStore";
// import { loadImage } from "./src/engine/core/loadAssets";
// const canvas = document.getElementById("gameWindow") as HTMLCanvasElement;
async function preload() {
  await AssetStore.addGPUAtlas("char", [
    { name: "vite", url: tilemap },
    { name: "cyberu", url: char },
  ]);
  await AssetStore.addGPUTexture("kiki", char);
  AssetStore.removeAsset("sound", "jeff");
}
function setup() {
  const worldd = Engine.createWorld("main");
  worldd.addEntity(new Player());
  // worldd.addEntity(new Tester(550, 310, "dynamic", 3000, 1));
  // worldd.addEntity(new Tester(2550, 335, "dynamic", 111, 1));
  // worldd.addEntity(new Tester(620, 345, "dynamic", 511, 0.3));
  // worldd.addEntity(new Tester(690, 345, "dynamic", 511, 0.3));
  // worldd.addEntity(new Tester(760, 345, "dynamic", 511, 0.3));
  // worldd.addEntity(new Tester(840, 375, "dynamic", 511, 0.1));
  // Array(10)
  //   .fill(null)
  //   .forEach((el) => {
  //     worldd.addEntity(
  //       new Tester(Math.random() * canvas.width, Math.random() * canvas.height, "static", 111, 1)
  //     );
  //   });
  // worldd.addEntity(new Tester(550, 440, "static"));
  // worldd.addEntity(new Tester(630, 440, "static"));
  worldd.addWorldMap(mapFile);
  worldd.addSystem("KeyInputs");
  worldd.addSystem("IndiePhysics");
  worldd.addSystem("MouseInputs");
  worldd.addSystem("LoadChunks");
  worldd.addSystem("IndiePhysics");
  worldd.addSystem("Animator");
  worldd.addSystem("Cameras");
  worldd.addSystem("Renderer");
  // worldd.addSystem("lightMap");
}
Engine.Initialize({ preload, setup });
