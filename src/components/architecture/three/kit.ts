/**
 * Shared toolkit for the procedural models: seeded textures, materials, a
 * mesh helper that tags every part, and a few architectural primitives.
 */
import * as THREE from "three";

export type ModelOptions = Record<string, string | number | boolean>;
/** `view` is the direction the camera looks from, when the default three-quarter view hides the point. */
export type Built = { group: THREE.Group; tick?: (t: number) => void; view?: [number, number, number] };

/* ---------------- textures ---------------- */

export function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

/** Value noise on a canvas: marble veins or porous travertine. */
export function stoneTexture(kind: "marble" | "travertine" | "sand", size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const rand = rng(kind === "marble" ? 7 : kind === "sand" ? 3 : 11);
  const G = 16, grid = Array.from({ length: (G + 1) * (G + 1) }, rand);
  const at = (x: number, y: number) => grid[(y % G) * (G + 1) + (x % G)];
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = (t: number) => t * t * (3 - 2 * t);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
  };
  const fbm = (x: number, y: number) => { let v = 0, amp = 0.5, f = 1; for (let o = 0; o < 5; o++) { v += amp * noise(x * f, y * f); amp *= 0.5; f *= 2; } return v; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x / size) * 4, v = (y / size) * 4, n = fbm(u, v);
    let r: number, g: number, b: number;
    if (kind === "marble") {
      const vein = Math.abs(Math.sin((u + v * 0.6) * 3 + n * 7));
      const k = 0.78 + 0.22 * Math.pow(vein, 0.35);
      r = 238 * k; g = 236 * k; b = 230 * k;
    } else if (kind === "travertine") {
      const pore = n > 0.62 ? 0.82 : 1;
      const k = (0.86 + 0.14 * n) * pore;
      r = 226 * k; g = 205 * k; b = 168 * k;
    } else {
      const k = 0.85 + 0.15 * n;
      r = 214 * k; g = 190 * k; b = 146 * k;
    }
    const i = (y * size + x) * 4;
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function stripes(color: string, line: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color; ctx.fillRect(0, 0, 128, 32);
  ctx.strokeStyle = line; ctx.lineWidth = 3;
  for (let x = 0; x < 128; x += 32) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.bezierCurveTo(x + 10, 0, x + 22, 30, x + 32, 24); ctx.stroke(); }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function coffers() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d9d2c3"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = i * 64 + 10, y = j * 64 + 10;
    ctx.fillStyle = "#a99d86"; ctx.fillRect(x, y, 44, 44);
    ctx.fillStyle = "#8d8069"; ctx.fillRect(x + 8, y + 8, 28, 28);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export type Mats = ReturnType<typeof materials>;
export function materials() {
  const marbleTex = stoneTexture("marble");
  const travTex = stoneTexture("travertine");
  const sandTex = stoneTexture("sand");
  sandTex.repeat.set(6, 6);
  return {
    marble: () => new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.42, metalness: 0 }),
    stone: () => new THREE.MeshStandardMaterial({ map: travTex, roughness: 0.85 }),
    dark: () => new THREE.MeshStandardMaterial({ color: "#3a3127", roughness: 0.9 }),
    gold: () => new THREE.MeshStandardMaterial({ color: "#d4a33b", roughness: 0.3, metalness: 0.8 }),
    roof: () => new THREE.MeshStandardMaterial({ color: "#a2512f", roughness: 0.75 }),
    sand: () => new THREE.MeshStandardMaterial({ map: sandTex, roughness: 1 }),
    coffers: () => { const t = coffers(); t.repeat.set(24, 6); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide }); },
    water: () => { const t = stripes("#3f8fd0", "#9fd3ff"); t.repeat.set(10, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9 }); },
    beam: () => new THREE.MeshBasicMaterial({ color: "#ffe9a8", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  };
}

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, part: string, at?: [number, number, number]) {
  const m = new THREE.Mesh(geo, mat);
  m.userData.part = part;
  m.castShadow = true;
  m.receiveShadow = true;
  if (at) m.position.set(...at);
  return m;
}


export function simpleColumn(m: THREE.Material, h: number, r: number, part: string, corinthian = false) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 20), m, part, [0, h / 2, 0]));
  g.add(mesh(new THREE.CylinderGeometry(r * (corinthian ? 1.15 : 1.3), r * 0.85, corinthian ? 0.5 : 0.28, 20), m, part, [0, h + (corinthian ? 0.25 : 0.14), 0]));
  g.add(mesh(new THREE.BoxGeometry(r * 2.8, 0.16, r * 2.8), m, part, [0, h + (corinthian ? 0.58 : 0.36), 0]));
  return g;
}

export function gable(width: number, height: number, depth: number, mat: THREE.Material, part: string) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(0, height); s.lineTo(-width / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, mat, part);
}

export function statue(m: Mats) {
  const g = new THREE.Group();
  const gold = m.gold();
  g.add(mesh(new THREE.BoxGeometry(1, 0.6, 1), m.stone(), "statue", [0, 0.3, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.2, 16), gold, "statue", [0, 1.7, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.3, 16, 12), gold, "statue", [0, 3.0, 0]));
  return g;
}

