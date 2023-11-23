import "../css/index.css";
import chest from "../assets/chest.png";
console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
const img = new Image();
img.src = chest;
img.onload = () => {
  console.log("loaded");
  document.getElementsByTagName("body")[0].appendChild(img);
};
