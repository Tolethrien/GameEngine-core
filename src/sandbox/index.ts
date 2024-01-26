import tilemap from "../assets/tilemap3.png";
import char from "../assets/char.png";
import Engine from "../core/engine";
import Player from "./entities/player";
import mapData from "./mapLUT.json";
import AuroraTexture from "../core/aurora/auroraTexture";
import AuroraBatcher from "../core/aurora/auroraBatcher";
import fontLato from "../assets/lato_regular_32.png";
import latoData from "../core/aurora/fonts/lato_regular_32.json";
import DogmaCore from "../core/dogma/core";
import EntityManager from "../core/dogma/entityManager";
/**
 * 2) rozkminic trzon ECS'a
 * 3) napisac trzon ECS'a
 * 4) rozkminic dobry system inputu
 * 5) UI!
 */
async function preload() {
  await AuroraTexture.createTextureArray({
    label: "userTextureAtlas",
    urls: [tilemap, char],
  });
  await AuroraBatcher.loadFont(fontLato, latoData);
  await AuroraBatcher.createBatcher({
    backgroundColor: [255, 250, 0, 255],
    bloomStrength: 16,
    maxQuadPerSceen: 15000,
    customCamera: true,
  });
}
function setup() {
  DogmaCore.createWorld("main");
  DogmaCore.addWorldMap(mapData, "isMap", "isInd");
  EntityManager.addEntityOnStart(new Player());
  DogmaCore.addSystem("KeyInputs");
  DogmaCore.addSystem("IndiePhysics");
  DogmaCore.addSystem("MouseInputs");
  DogmaCore.addSystem("LoadChunks");
  DogmaCore.addSystem("Animator");
  DogmaCore.addSystem("Cameras");
  DogmaCore.addSystem("Renderer");
}
Engine.Initialize({ preload, setup });
