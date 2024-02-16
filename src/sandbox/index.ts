import tilemap from "../assets/tilemap3.png";
import char from "../assets/char.png";
import Engine from "../core/engine";
import Player from "./entities/player";
import mapData from "./mapLUT.json";
import AuroraTexture from "../core/aurora/auroraTexture";
import AuroraBatcher from "../core/aurora/urp/batcher";
import fontLato from "../assets/lato_regular_32.png";
import latoData from "../core/aurora/fonts/lato_regular_32.json";
import DogmaCore from "../core/dogma/core";
import EntityManager from "../core/dogma/entityManager";
import Flask from "./entities/flask";
/**
 * 4) rozkminic dobry system inputu
 * 5) UI!
 */
async function preload() {
  await AuroraTexture.createTextureArray({
    label: "userTextureAtlas",
    urls: [tilemap, char],
  });
  await AuroraTexture.createTextureArray({
    label: "GUITextureAtlas",
    urls: [tilemap, char],
  });
  // AuroraTexture.createEmptyTextureArray({
  //   label: "GUITextureAtlas",
  //   size: { height: 100, width: 100, arraySize: 2 },
  // });
  await AuroraBatcher.loadFont(fontLato, latoData);
  await AuroraBatcher.createBatcher({
    backgroundColor: [255, 250, 0, 255],
    maxQuadPerSceen: 15000,
    customCamera: true,
    bloom: { active: true, str: 16 },
  });
}
function setup() {
  DogmaCore.createWorld("main");
  DogmaCore.addWorldMap(mapData, "isMap", "isInd");
  EntityManager.addEntityOnStart(new Player());
  EntityManager.addEntityOnStart(new Flask([150, 0, 0], 740, 840));
  EntityManager.addEntityOnStart(new Flask([150, 0, 0], 900, 900));
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
