import tilemap from "../assets/tilemap3.png";
import char from "../assets/char.png";
import Engine from "../core/engine";
import Player from "./entities/player";
import AssetStore from "../core/stores/assetStore";
import mapData from "./mapLUT.json";

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
  worldd.addWorldMap(mapData, "isMap", "isInd");
  worldd.addSystem("KeyInputs");
  worldd.addSystem("IndiePhysics");
  worldd.addSystem("MouseInputs");
  worldd.addSystem("LoadChunks");
  worldd.addSystem("Animator");
  worldd.addSystem("Cameras");
  worldd.addSystem("Renderer");
  // worldd.addSystem("lightMap");
}
Engine.Initialize({ preload, setup, recordEntityChangedOnFrame: true });
