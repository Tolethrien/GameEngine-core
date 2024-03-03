@group(0) @binding(0) var fontAtlasSampler: sampler;
@group(0) @binding(1) var fontAtlas: texture_2d_array<f32>;

struct VertexInput {
        @location(0) position: vec2f,
        @location(1) dunno: f32,
        @location(2) fontSize: f32,
        @location(3) color: vec4f,
        @location(4) size: vec2f,
        @location(5) uv: vec4f,
        @location(6) window: vec2f,
        @builtin(vertex_index) vi: u32,

};
struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(2) @interpolate(linear) uv: vec2f,
        @location(3) @interpolate(linear) color: vec4f,
        @location(4) @interpolate(linear) fontSize: f32,

};


@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        output.position = getVertexPosition(input.vi,input.position,input.size);
        output.position.y = -output.position.y;
        output.color = input.color;
        output.fontSize = input.fontSize;
        output.uv = getTextureCoords(input.vi,input.uv);

        return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        let distance = textureSample(fontAtlas, fontAtlasSampler, input.uv,0).a;
 //0.4-0.1 kontroluje rozmycie w zaleznosci od wielkosci fontu
    var width = mix(0.4, 0.1, clamp(input.fontSize, 0, 40) / 40.0);
        let alpha = input.color.w * smoothstep(0.5 - width, 0.5 + width, distance);
        return vec4f(input.color.rgb, alpha);
}

fn getVertexPosition(index: u32, pos: vec2f, size: vec2f) -> vec4f {
  let screenSize = vec2f(900,600);
  var posNDC = (pos / screenSize) * 2.0 - 1.0;
  let sizeNDC = size / screenSize * 2.0;

  switch(index) {
    case 0 { return vec4f(posNDC.x, posNDC.y, 0, 1); }
    case 1 { return vec4f(posNDC.x + sizeNDC.x, posNDC.y, 0, 1); }
    case 2 { return vec4f(posNDC.x, posNDC.y + sizeNDC.y, 0, 1); }
    case 3 { return vec4f(posNDC.x + sizeNDC.x, posNDC.y + sizeNDC.y, 0, 1); }
    default { return vec4f(0, 0, 0, 0); }
  }
}
fn getTextureCoords(index: u32, crop: vec4f) -> vec2f {
  switch(index) {
    case 0 { return vec2f(crop.x, crop.y); }
    case 1 { return vec2f(crop.z, crop.y); }
    case 2 { return vec2f(crop.x, crop.w); }
    case 3 { return vec2f(crop.z, crop.w); }
    default { return vec2f(0, 0); }
  }
}