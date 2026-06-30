'use client';

import { useEffect, useRef } from 'react';

const wgslCode = `
struct Uniforms {
    time: f32,
    width: f32,
    height: f32,
    mouseX: f32,
    mouseY: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0)
    );
    var out: VertexOutput;
    out.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    // uv mapping -1 to 1
    out.uv = pos[vertexIndex];
    return out;
}

// Math utilities
fn rot(a: f32) -> mat2x2<f32> {
  let s = sin(a);
  let c = cos(a);
  return mat2x2<f32>(c, -s, s, c);
}

// Smooth min for organic blending
fn smin(a: f32, b: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Distance Functions
fn sdSphere(p: vec3<f32>, s: f32) -> f32 {
  return length(p) - s;
}

// 3D Noise (simplified via sine waves for organic warping)
fn warp(p: vec3<f32>, t: f32) -> f32 {
  let p2 = p * 2.0;
  return sin(p2.x + t) * sin(p2.y + t * 0.8) * sin(p2.z + t * 1.2) * 0.2;
}

// Scene Distance Field
fn map(p: vec3<f32>) -> f32 {
  let t = uniforms.time * 0.5;
  var pos = p;
  
  // Rotate whole object based on time and mouse
  // Mouse mapped from 0..1 to -1..1 roughly
  let mx = (uniforms.mouseX - 0.5) * 2.0;
  let my = (uniforms.mouseY - 0.5) * 2.0;

  let mRotY = rot(mx * 3.14 + t * 0.2);
  let tmpX = pos.x * mRotY[0][0] + pos.z * mRotY[0][1];
  let tmpZ = pos.x * mRotY[1][0] + pos.z * mRotY[1][1];
  pos.x = tmpX;
  pos.z = tmpZ;
  
  let mRotX = rot(my * 3.14 + t * 0.1);
  let tmpY = pos.y * mRotX[0][0] + pos.z * mRotX[0][1];
  let tmpZ2 = pos.y * mRotX[1][0] + pos.z * mRotX[1][1];
  pos.y = tmpY;
  pos.z = tmpZ2;

  // Base shape: morphed spheres
  let d1 = sdSphere(pos - vec3<f32>(0.5 * sin(t), 0.5 * cos(t*1.3), 0.0), 0.7);
  let d2 = sdSphere(pos + vec3<f32>(0.5 * cos(t*1.1), 0.5 * sin(t*0.9), 0.0), 0.7);
  let d3 = sdSphere(pos + vec3<f32>(0.0, 0.0, 0.5 * sin(t*1.5)), 0.6);
  
  var d = smin(d1, d2, 0.8);
  d = smin(d, d3, 0.8);
  
  // Apply organic warp
  d += warp(pos, t * 2.0);
  
  return d;
}

// Normal calculation
fn calcNormal(p: vec3<f32>) -> vec3<f32> {
  let e = vec2<f32>(0.001, 0.0);
  let nx = map(p + e.xyy) - map(p - e.xyy);
  let ny = map(p + e.yxy) - map(p - e.yxy);
  let nz = map(p + e.yyx) - map(p - e.yyx);
  return normalize(vec3<f32>(nx, ny, nz));
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  var uv = in.uv;
  
  // Aspect ratio correction
  uv.x *= uniforms.width / uniforms.height;

  let t = uniforms.time;

  // Camera setup
  var ro = vec3<f32>(0.0, 0.0, 4.0); // Ray origin
  var rd = normalize(vec3<f32>(uv, -1.0)); // Ray direction

  // Raymarching
  var d0 = 0.0;
  var p = vec3<f32>(0.0);
  var hit = false;
  
  for(var i: i32 = 0; i < 80; i++) {
    p = ro + rd * d0;
    let dS = map(p);
    d0 += dS;
    if(dS < 0.001) {
      hit = true;
      break;
    }
    if(d0 > 10.0) {
      break;
    }
  }

  // Background color (transparent to allow underlying CSS)
  var col = vec3<f32>(0.0);
  var alpha = 0.0;
  
  if (hit) {
    alpha = 1.0;
    let n = calcNormal(p);
    
    // Lighting setup
    let lightPos = vec3<f32>(2.0, 3.0, 4.0);
    let l = normalize(lightPos - p);
    let v = normalize(ro - p);
    
    // Diffuse lighting
    let dif = max(dot(n, l), 0.0);
    
    // Specular lighting (metallic)
    let h = normalize(l + v);
    let spec = pow(max(dot(n, h), 0.0), 64.0);
    
    // Fresnel / Rim lighting
    let fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    
    // Colors
    let baseColor = vec3<f32>(0.05, 0.06, 0.05); // Dark matter
    let accentColor = vec3<f32>(0.62, 1.0, 0.0); // Acid green
    
    // Composition
    col = baseColor * (dif * 0.5 + 0.5);
    col += spec * 0.8;
    
    // Acid green inner glow and rim light
    col += accentColor * fresnel * 1.5;
    
    // Subsurface scattering approximation (glow based on depth/thickness)
    let sss = smoothstep(0.5, 0.0, map(p + l * 0.5));
    col += accentColor * sss * 0.4;
  }

  // Gamma correction
  col = pow(col, vec3<f32>(0.4545));

  return vec4<f32>(col, alpha);
}
`;

export function WebgpuCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let device: GPUDevice | null = null;

    const initWebGPU = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!navigator.gpu) {
        console.error('WebGPU not supported on this browser.');
        // Fallback drawing could go here
        return;
      }

      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!adapter) {
        console.error('No WebGPU adapter found.');
        return;
      }

      device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');
      if (!context) {
        console.error('WebGPU context not available.');
        return;
      }

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device,
        format,
        alphaMode: 'premultiplied', // Allow transparency
      });

      const shaderModule = device.createShaderModule({ code: wgslCode });

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [
            {
              format,
              blend: {
                color: {
                  srcFactor: 'src-alpha',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
                alpha: {
                  srcFactor: 'one',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
              },
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });

      // Uniforms: time(f32), width(f32), height(f32), mouseX(f32), mouseY(f32) -> 5 f32 = 20 bytes. Align to 32 bytes (8 f32s)
      const uniformBufferSize = 8 * 4;
      const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: uniformBuffer },
          },
        ],
      });

      const uniformData = new Float32Array(8);
      let mouseX = 0.5;
      let mouseY = 0.5;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const resize = () => {
        // Use container dimensions instead of window to fit component size
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width * window.devicePixelRatio;
          canvas.height = rect.height * window.devicePixelRatio;
        }
      };

      window.addEventListener('resize', resize);
      resize();

      const startTime = performance.now();

      const render = () => {
        const time = (performance.now() - startTime) / 1000.0;

        uniformData[0] = time;
        uniformData[1] = canvas.width;
        uniformData[2] = canvas.height;
        uniformData[3] = mouseX;
        uniformData[4] = mouseY;

        if (!device) return;
        const commandEncoder = device.createCommandEncoder();
        if (!commandEncoder) return;

        device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

        const textureView = context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 }, // Transparent clear
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.draw(6);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', resize);
      };
    };

    let cleanup: (() => void) | undefined;
    initWebGPU().then((res) => {
      cleanup = res;
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanup) cleanup();
      if (device) device.destroy();
    };
  }, []);

  return (
    <div className="relative flex aspect-square w-full max-w-[800px] items-center justify-center">
      {/* 
        Fallback visual in case WebGPU is not supported by the browser. 
        Hidden behind the canvas if WebGPU works, since WebGPU canvas background is clear.
      */}
      <div className="absolute inset-0 animate-pulse rounded-full border border-accent/20 opacity-20" />

      <canvas
        ref={canvasRef}
        className="pointer-events-none z-10 block h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
