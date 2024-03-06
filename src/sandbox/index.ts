import tilemap from "../assets/tilemap3.png";
import Engine from "../core/engine";
import char from "../assets/char.png";
import Player from "./entities/player";
import mapData from "./mapLUT.json";
import AuroraBatcher from "../core/aurora/urp/batcher";
import DogmaCore from "../core/dogma/core";
import EntityManager from "../core/dogma/entityManager";
import Flask from "./entities/flask";
import { randomColor } from "../core/utils/utils";
import uiEl from "../assets/uiElements.png";
import roboto from "./fonts/roboto.ttf";
import tamoto from "./fonts/MedievalSharp.ttf";

async function preload() {
  await AuroraBatcher.createTextureBatchGame({
    textures: [tilemap, char, uiEl],
  });
  await AuroraBatcher.loadFonts([roboto, tamoto]);
  await AuroraBatcher.createBatcher({
    backgroundColor: [255, 255, 0, 255],
    maxQuadPerSceen: 15000,
    customCamera: true,
    bloom: { active: true, str: 16 },
  });
}
function setup() {
  DogmaCore.createWorld("main");
  DogmaCore.addWorldMap(mapData, "isMap", "isInd");
  EntityManager.addEntityOnStart(new Player());
  EntityManager.addEntityOnStart(new Flask(randomColor(), 740, 840));
  EntityManager.addEntityOnStart(new Flask(randomColor(), 900, 900));
  DogmaCore.addSystem("KeyInputs");
  DogmaCore.addSystem("IndiePhysics");
  DogmaCore.addSystem("MouseInputs");
  DogmaCore.addSystem("Items", true);
  DogmaCore.addSystem("LoadChunks");
  DogmaCore.addSystem("Animator");
  DogmaCore.addSystem("Cameras");
  DogmaCore.addSystem("Renderer");
}
Engine.Initialize({ preload, setup });
