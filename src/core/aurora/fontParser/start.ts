import { invariant } from "./invariant";
import { UIRenderer } from "./UIRenderer";
import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";
import { parseTTF } from "./parseTTF";
import { renderFontAtlas } from "./renderFontAtlas";
import { prepareLookups } from "./prepareLookups";

const width = window.innerWidth;
const height = window.innerHeight;
const SAMPLE_COUNT = 4;

if (!navigator.gpu) {
  const div = document.createElement("div");
  div.setAttribute(
    "style",
    "display: flex; align-items: center; justify-content: center; font-family: sans-serif; height: 100vh;"
  );
  div.innerText = "This browser does not support WebGPU.";
  document.body.appendChild(div);
}

async function run() {
  document.body.setAttribute("style", "margin: 0");

  const canvas = document.createElement("canvas");
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.setAttribute(
    "style",
    `width: ${width}px; height: ${height}px; display: flex;`
  );
  document.body.appendChild(canvas);

  const entry = navigator.gpu;
  invariant(entry, "WebGPU is not supported in this browser.");

  const context = canvas.getContext("webgpu");
  invariant(context, "WebGPU is not supported in this browser.");

  const adapter = await entry.requestAdapter();
  invariant(adapter, "No GPU found on this system.");

  const device = await adapter.requestDevice();

  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "opaque",
  });

  // TODO: fix this path
  const fontFile = await fetch("https://tchayen.com/assets/Inter.ttf").then(
    (result) => result.arrayBuffer()
  );

  const ttf = parseTTF(fontFile);
  const lookups = prepareLookups(ttf);
  const fontAtlas = await renderFontAtlas(lookups, fontFile, { useSDF: true });
  const fontAtlasTexture = await createTexture(device, fontAtlas);

  const colorTexture = device.createTexture({
    label: "color",
    size: { width: canvas.width, height: canvas.height },
    sampleCount: SAMPLE_COUNT,
    format: "bgra8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const colorTextureView = colorTexture.createView({ label: "color" });

  let elapsedTime = 3000;
  let before = 0;

  const ui = new UIRenderer(device, context, colorTextureView);
  ui.setFont(lookups, fontAtlasTexture);

  function render() {
    invariant(context, "WebGPU is not supported in this browser.");

    const sizes = [10, 12, 14, 16, 20, 32];
    let y = 16;
    for (let i = 0; i < sizes.length; i++) {
      ui.text(
        "The quick brown fox jumps over the lazy dog",
        new Vec2(16, y),
        sizes[i],
        new Vec4(0, 0, 0, 1)
      );
      y += sizes[i] + 5;
    }

    ui.text(
      ". ‥ … → ← ↑ ↓ Å Ä Ö Ë Ü Ï Ÿ å ä ö ë ü ï ÿ Ø ø •",
      new Vec2(16, 170),
      16,
      new Vec4(0.5, 0.5, 0.5, 1)
    );
    ui.text(
      "12.4 pt  64%  90px  45 kg   12 o'clock  $64 $7  €64 €64  £7 £7",
      new Vec2(16, 200),
      16,
      new Vec4(0.5, 0.5, 0.5, 1)
    );

    ui.render();

    const after = performance.now();
    const seconds = (after - before) / 1000;
    before = after;
    elapsedTime += seconds;

    // requestAnimationFrame(render);
  }

  render();
}

run();

async function createTexture(device: GPUDevice, imageBitmap: ImageBitmap) {
  const size = { width: imageBitmap.width, height: imageBitmap.height };

  const texture = device.createTexture({
    label: "image bitmap",
    size,
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture },
    size
  );

  return texture;
}
