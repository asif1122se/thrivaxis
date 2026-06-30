'use client';

import { useEffect, useRef } from 'react';

export type ShapeType =
  | 'torus'
  | 'box'
  | 'octahedron'
  | 'pyramid'
  | 'capsule'
  | 'torus_knot'
  | 'hex_prism'
  | 'boolean_core'
  | 'fractal';

interface WebgpuShapeProps {
  shape: ShapeType;
  color?: [number, number, number]; // RGB 0-1
}

export function WebgpuShape({ shape, color = [0.62, 1.0, 0.0] }: WebgpuShapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let device: GPUDevice | null = null;

    const initWebGPU = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!navigator.gpu) return;

      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!adapter) return;

      device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');
      if (!context) return;

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
      });

      // SDF Map function based on shape
      let mapFunction = '';
      if (shape === 'torus') {
        mapFunction = `
          let q = vec2<f32>(length(pos.xz) - 0.5, pos.y);
          var d = length(q) - 0.2;
          d += sin(pos.x * 10.0 + t) * sin(pos.y * 10.0 + t) * sin(pos.z * 10.0) * 0.05; // organic warp
          return d;
        `;
      } else if (shape === 'box') {
        mapFunction = `
          let b = vec3<f32>(0.4, 0.4, 0.4);
          let q = abs(pos) - b;
          var d = length(max(q, vec3<f32>(0.0, 0.0, 0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
          d -= 0.1; // rounded edges
          return d;
        `;
      } else if (shape === 'octahedron') {
        mapFunction = `
          let s = 0.6;
          var p = abs(pos);
          return (p.x + p.y + p.z - s) * 0.57735027;
        `;
      } else if (shape === 'pyramid') {
        mapFunction = `
          let h = 0.8;
          var p = pos;
          p.y -= 0.2;
          var d = 0.0;
          if (p.y > h) { d = length(p - vec3<f32>(0.0, h, 0.0)); }
          else if (p.y < 0.0) { d = max(p.y, length(vec2<f32>(p.x, p.z)) - h); }
          else {
            let xz = length(vec2<f32>(p.x, p.z));
            d = (xz + p.y - h) * 0.70710678;
          }
          return d - 0.1; // slight rounding
        `;
      } else if (shape === 'capsule') {
        mapFunction = `
          let a = vec3<f32>(0.0, -0.4, 0.0);
          let b = vec3<f32>(0.0, 0.4, 0.0);
          let pa = pos - a;
          let ba = b - a;
          let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          return length(pa - ba * h) - 0.3;
        `;
      } else if (shape === 'torus_knot') {
        mapFunction = `
          let r1 = 0.5;
          let r2 = 0.15;
          let a = atan2(pos.x, pos.z);
          let p2 = vec3<f32>(length(pos.xz) - r1, pos.y, a * 3.0);
          let c = cos(p2.z);
          let s = sin(p2.z);
          let twistedY = p2.x * s + p2.y * c;
          let twistedX = p2.x * c - p2.y * s;
          var d = length(vec2<f32>(twistedX, twistedY)) - r2;
          d += sin(pos.x * 15.0 + t * 2.0) * sin(pos.y * 15.0 - t) * 0.03; // fluid warp
          return d * 0.5; // step safety multiplier
        `;
      } else if (shape === 'hex_prism') {
        mapFunction = `
          let h = vec2<f32>(0.4, 0.4);
          var p = abs(pos);
          let k = vec3<f32>(-0.8660254, 0.5, 0.57735);
          p = p - 2.0 * min(dot(k.xy, p.xz), 0.0) * vec3<f32>(k.x, 0.0, k.y);
          let d1 = length(p.xz - vec2<f32>(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.z - h.x);
          let d2 = p.y - h.y;
          return min(max(d1, d2), 0.0) + length(max(vec2<f32>(d1, d2), vec2<f32>(0.0, 0.0))) - 0.05;
        `;
      } else if (shape === 'boolean_core') {
        mapFunction = `
          let sphere = length(pos) - 0.6;
          let box = length(max(abs(pos) - vec3<f32>(0.45, 0.45, 0.45), vec3<f32>(0.0, 0.0, 0.0))) - 0.1;
          let hole1 = length(pos.xz) - 0.25;
          let hole2 = length(pos.xy) - 0.25;
          let hole3 = length(pos.yz) - 0.25;
          var d = max(sphere, -box); // Subtract box
          d = max(d, -hole1); // Punch holes
          d = max(d, -hole2);
          d = max(d, -hole3);
          return d;
        `;
      } else if (shape === 'fractal') {
        mapFunction = `
          var z = pos;
          var dr = 1.0;
          var r = 0.0;
          let power = 6.0 + sin(t * 0.5) * 2.0; 
          for (var i = 0; i < 4; i++) {
              r = length(z);
              if (r > 2.0) { break; }
              let theta = acos(z.y / r);
              let phi = atan2(z.x, z.z);
              dr = pow(r, power - 1.0) * power * dr + 1.0;
              let zr = pow(r, power);
              z = zr * vec3<f32>(sin(theta * power) * cos(phi * power), cos(theta * power), sin(theta * power) * sin(phi * power));
              z = z + pos;
          }
          return 0.5 * log(r) * r / dr;
        `;
      }

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
            out.uv = pos[vertexIndex];
            return out;
        }

        fn rot(a: f32) -> mat2x2<f32> {
          let s = sin(a);
          let c = cos(a);
          return mat2x2<f32>(c, -s, s, c);
        }

        fn map(p: vec3<f32>) -> f32 {
          let t = uniforms.time * 0.5;
          var pos = p;
          
          let mx = (uniforms.mouseX - 0.5) * 2.0;
          let my = (uniforms.mouseY - 0.5) * 2.0;

          // Continuous slow rotation + mouse
          let mRotY = rot(mx + t);
          let tmpX = pos.x * mRotY[0][0] + pos.z * mRotY[0][1];
          let tmpZ = pos.x * mRotY[1][0] + pos.z * mRotY[1][1];
          pos.x = tmpX;
          pos.z = tmpZ;
          
          let mRotX = rot(my + t * 0.8);
          let tmpY = pos.y * mRotX[0][0] + pos.z * mRotX[0][1];
          let tmpZ2 = pos.y * mRotX[1][0] + pos.z * mRotX[1][1];
          pos.y = tmpY;
          pos.z = tmpZ2;

          ${mapFunction}
        }

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
          uv.x *= uniforms.width / uniforms.height;

          var ro = vec3<f32>(0.0, 0.0, 3.0);
          var rd = normalize(vec3<f32>(uv, -1.0));

          var d0 = 0.0;
          var p = vec3<f32>(0.0);
          var hit = false;
          
          for(var i: i32 = 0; i < 60; i++) {
            p = ro + rd * d0;
            let dS = map(p);
            d0 += dS;
            if(dS < 0.001) { hit = true; break; }
            if(d0 > 10.0) { break; }
          }

          var col = vec3<f32>(0.0);
          var alpha = 0.0;
          
          if (hit) {
            alpha = 1.0;
            let n = calcNormal(p);
            
            let lightPos = vec3<f32>(2.0, 3.0, 4.0);
            let l = normalize(lightPos - p);
            let v = normalize(ro - p);
            
            let dif = max(dot(n, l), 0.0);
            let h = normalize(l + v);
            let spec = pow(max(dot(n, h), 0.0), 32.0);
            let fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.5);
            
            let baseColor = vec3<f32>(0.05, 0.06, 0.05);
            let accentColor = vec3<f32>(${color[0].toFixed(2)}, ${color[1].toFixed(2)}, ${color[2].toFixed(2)});
            
            col = baseColor * (dif * 0.5 + 0.5);
            col += spec * 0.6;
            col += accentColor * fresnel * 1.0;
          }

          col = pow(col, vec3<f32>(0.4545));
          return vec4<f32>(col, alpha);
        }
      `;

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
                alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              },
            },
          ],
        },
        primitive: { topology: 'triangle-list' },
      });

      const uniformBuffer = device.createBuffer({
        size: 8 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
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
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
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
  }, [shape, color]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        className="pointer-events-none z-10 block h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
