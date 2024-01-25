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
  DogmaCore.createWorld("str");
  DogmaCore.setActiveWorld = "str";
  console.log(DogmaCore.getActiveWorldName);
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
}
Engine.Initialize({ preload, setup });
