import tilemap from "../assets/tilemap3.png";
import char from "../assets/char.png";
import Engine from "../core/engine";
import Player from "./entities/player";
import mapData from "./mapLUT.json";
import AuroraTexture from "../core/aurora/auroraTexture";
import AuroraBatcher from "../core/aurora/urp/batcher";
import DogmaCore from "../core/dogma/core";
import EntityManager from "../core/dogma/entityManager";
import Flask from "./entities/flask";
import { randomColor } from "../core/utils/utils";
import uiEl from "../assets/uiElements.png";
import roboto from "./fonts/roboto.ttf";

/**
 * 4) rozkminic dobry system inputu
 * 5) UI!
 */
async function preload() {
  await AuroraTexture.createTextureArray({
    label: "userTextureAtlas",
    urls: [tilemap, char, uiEl],
  });

  await AuroraBatcher.loadFont(roboto);
  await AuroraBatcher.createBatcher({
    backgroundColor: [255, 250, 0, 255],
    maxQuadPerSceen: 15000,
    customCamera: true,
    bloom: { active: false, str: 16 },
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
