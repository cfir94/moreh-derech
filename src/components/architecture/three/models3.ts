/**
 * Burial up close: an ossuary with the three bones that set its size, and a
 * decorated sarcophagus in the style of Beit She'arim. Units are metres.
 */
import * as THREE from "three";
import { mesh, type Built, type Mats, type ModelOptions } from "./kit";

export type ModelId3 = "ossuary" | "sarcophagus";

function stoneMat(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...extra });
}

/** Chip-carved rosettes and a frame, the commonest ossuary decoration. */
function carvedFace(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = Math.round((512 * h) / w);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d9cbab"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#7a6446"; ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.setLineDash([6, 6]); ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52); ctx.setLineDash([]);
  const cy = canvas.height / 2, r = Math.min(canvas.height / 2 - 40, 90);
  for (const cx of [canvas.width * 0.27, canvas.width * 0.73]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, r * 0.46, r * 0.17, a, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // the central pillar ("nefesh"-like column) between the rosettes
  ctx.strokeRect(canvas.width / 2 - 14, 40, 28, canvas.height - 80);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function label(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(20, 16, 10, .78)";
  ctx.beginPath(); ctx.roundRect(4, 8, 504, 80, 40); ctx.fill();
  ctx.fillStyle = "#ffe7b0"; ctx.font = "bold 40px Heebo, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.fillText(text, 256, 50);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(0.42, 0.08, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function dimension(from: THREE.Vector3, to: THREE.Vector3, text: string, color = "#ffb85c") {
  const g = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color, depthTest: false });
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), mat));
  for (const p of [from, to]) {
    const tick = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color, depthTest: false }));
    tick.position.copy(p);
    g.add(tick);
  }
  const l = label(text);
  l.position.copy(from.clone().add(to).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.05, 0));
  g.add(l);
  g.renderOrder = 10;
  return g;
}

/* ---------------- bones ---------------- */

function femur(bone: THREE.Material) {
  const g = new THREE.Group();
  const shaft = new THREE.CylinderGeometry(0.014, 0.017, 0.4, 16); shaft.rotateZ(Math.PI / 2);
  g.add(mesh(shaft, bone, "femur"));
  g.add(mesh(new THREE.SphereGeometry(0.024, 16, 12), bone, "femur", [-0.215, 0.02, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.05, 12).rotateZ(-0.9), bone, "femur", [-0.19, 0.01, 0]));
  for (const z of [-0.016, 0.016]) g.add(mesh(new THREE.SphereGeometry(0.021, 14, 10), bone, "femur", [0.21, -0.004, z]));
  return g;
}

function pelvis(bone: THREE.Material) {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    const wing = mesh(new THREE.SphereGeometry(0.075, 20, 14, 0, Math.PI), bone, "pelvis", [0, 0.03, side * 0.07]);
    wing.scale.set(0.9, 1, 0.35);
    wing.rotation.y = side > 0 ? 0 : Math.PI;
    wing.rotation.z = side * 0.2;
    g.add(wing);
    g.add(mesh(new THREE.TorusGeometry(0.035, 0.011, 8, 18), bone, "pelvis", [0.01, -0.035, side * 0.045]));
  }
  g.add(mesh(new THREE.BoxGeometry(0.05, 0.07, 0.04), bone, "pelvis", [-0.045, 0.01, 0]));
  return g;
}

function skull(bone: THREE.Material, dark: THREE.Material) {
  const g = new THREE.Group();
  const cranium = mesh(new THREE.SphereGeometry(0.085, 24, 18), bone, "skull", [0, 0.02, 0]);
  cranium.scale.set(1.15, 1, 0.9);
  g.add(cranium);
  g.add(mesh(new THREE.BoxGeometry(0.07, 0.06, 0.075), bone, "skull", [0.065, -0.045, 0]));
  for (const z of [-0.025, 0.025]) g.add(mesh(new THREE.SphereGeometry(0.016, 10, 8), dark, "skull", [0.092, -0.01, z]));
  return g;
}

/* ---------------- ossuary ---------------- */

function buildOssuary(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const xray = Boolean(o.xray ?? true);
  const open = Number(o.open ?? 0.6);
  const L = 0.6, H = 0.32, D = 0.29, T = 0.025;
  const stone = stoneMat("#d4c4a1", xray ? { transparent: true, opacity: 0.32, depthWrite: false } : {});
  const face = new THREE.MeshStandardMaterial({ map: carvedFace(L, H), roughness: 0.85, ...(xray ? { transparent: true, opacity: 0.45, depthWrite: false } : {}) });
  group.add(mesh(new THREE.BoxGeometry(L, T, D), stone, "box", [0, T / 2, 0]));
  group.add(mesh(new THREE.BoxGeometry(L, H, T), face, "rosettes", [0, H / 2, D / 2 - T / 2]));
  group.add(mesh(new THREE.BoxGeometry(L, H, T), stone, "box", [0, H / 2, -D / 2 + T / 2]));
  for (const x of [-L / 2 + T / 2, L / 2 - T / 2]) group.add(mesh(new THREE.BoxGeometry(T, H, D), stone, "box", [x, H / 2, 0]));
  for (const x of [-L / 2 + 0.03, L / 2 - 0.03]) for (const z of [-D / 2 + 0.03, D / 2 - 0.03]) group.add(mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), stone, "box", [x, -0.015, z]));
  // a gently vaulted lid that lifts and slides
  const lidShape = new THREE.Shape();
  lidShape.moveTo(-D / 2, 0); lidShape.lineTo(D / 2, 0); lidShape.quadraticCurveTo(D / 2, 0.06, 0, 0.07); lidShape.quadraticCurveTo(-D / 2, 0.06, -D / 2, 0);
  const lidGeo = new THREE.ExtrudeGeometry(lidShape, { depth: L + 0.02, bevelEnabled: false });
  lidGeo.translate(0, 0, -(L + 0.02) / 2); lidGeo.rotateY(Math.PI / 2);
  const lid = mesh(lidGeo, stoneMat("#cdbd98"), "lid", [-open * 0.32, H + open * 0.12, 0]);
  lid.rotation.z = open * 0.35;
  group.add(lid);
  // the bones that set the measurements
  const bone = stoneMat("#efe5cc", { roughness: 0.6 });
  const dark = stoneMat("#2a2118");
  const f = femur(bone); f.position.set(0, T + 0.03, -0.07); group.add(f);
  const p = pelvis(bone); p.position.set(-0.12, T + 0.1, 0.04); group.add(p);
  const s = skull(bone, dark); s.position.set(0.16, T + 0.1, 0.05); group.add(s);
  // the rule, drawn: longer than the femur, wider than the pelvis, taller than the skull
  group.add(dimension(new THREE.Vector3(-0.235, T + 0.03, -D / 2 - 0.06), new THREE.Vector3(0.235, T + 0.03, -D / 2 - 0.06), "אורך > עצם הירך"));
  group.add(dimension(new THREE.Vector3(-L / 2 - 0.07, T + 0.09, -0.115), new THREE.Vector3(-L / 2 - 0.07, T + 0.09, 0.115), "רוחב > האגן"));
  group.add(dimension(new THREE.Vector3(L / 2 + 0.07, T + 0.01, 0.05), new THREE.Vector3(L / 2 + 0.07, T + 0.2, 0.05), "גובה > הגולגולת"));
  const floor = mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.02, 48), m.stone(), "ground", [0, -0.04, 0]);
  group.add(floor);
  return { group, view: [0.55, 0.75, 1] };
}

/* ---------------- sarcophagus ---------------- */

function garland(radius: number, mat: THREE.Material) {
  const g = new THREE.TorusGeometry(radius, radius * 0.16, 10, 28, Math.PI);
  g.rotateZ(Math.PI);
  return mesh(g, mat, "garlands");
}

function buildSarcophagus(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const open = Boolean(o.open);
  const compare = Boolean(o.compare);
  const L = 2.15, H = 0.85, D = 0.85;
  const chest = stoneMat("#d8c7a2");
  const relief = stoneMat("#cbb88f");
  // the chest, hollowed: four walls and a floor
  group.add(mesh(new THREE.BoxGeometry(L, 0.12, D), chest, "chest", [0, 0.06, 0]));
  for (const z of [-D / 2 + 0.06, D / 2 - 0.06]) group.add(mesh(new THREE.BoxGeometry(L, H, 0.12), chest, "chest", [0, H / 2, z]));
  for (const x of [-L / 2 + 0.06, L / 2 - 0.06]) group.add(mesh(new THREE.BoxGeometry(0.12, H, D), chest, "chest", [x, H / 2, 0]));
  group.add(mesh(new THREE.BoxGeometry(L + 0.06, 0.08, D + 0.06), chest, "chest", [0, 0.04, 0]));
  // front: two garlands hung from bulls' heads, rosettes in their loops, a tabula ansata in the middle
  const front = D / 2 + 0.005;
  for (const x of [-0.62, 0.62]) {
    const gl = garland(0.26, relief); gl.position.set(x, 0.55, front); group.add(gl);
    group.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24).rotateX(Math.PI / 2), relief, "rosettes", [x, 0.4, front + 0.01]));
  }
  for (const x of [-0.95, -0.3, 0.3, 0.95]) group.add(mesh(new THREE.SphereGeometry(0.06, 12, 10), relief, "garlands", [x, 0.58, front + 0.02]));
  const tabula = new THREE.Shape();
  tabula.moveTo(-0.16, -0.1); tabula.lineTo(0.16, -0.1); tabula.lineTo(0.16, -0.03); tabula.lineTo(0.24, 0); tabula.lineTo(0.16, 0.03); tabula.lineTo(0.16, 0.1);
  tabula.lineTo(-0.16, 0.1); tabula.lineTo(-0.16, 0.03); tabula.lineTo(-0.24, 0); tabula.lineTo(-0.16, -0.03); tabula.lineTo(-0.16, -0.1);
  const tg = new THREE.ExtrudeGeometry(tabula, { depth: 0.02, bevelEnabled: false });
  group.add(mesh(tg, relief, "tabula", [0, 0.45, front]));
  // short sides: a lion in relief, kept simple
  for (const side of [-1, 1]) {
    const x = side * (L / 2 + 0.005);
    const lion = new THREE.Group();
    lion.add(mesh(new THREE.BoxGeometry(0.02, 0.18, 0.42), relief, "lions", [0, 0.42, 0]));
    lion.add(mesh(new THREE.SphereGeometry(0.1, 14, 10), relief, "lions", [0, 0.56, side * 0.2]));
    for (const z of [-0.14, 0.12]) lion.add(mesh(new THREE.BoxGeometry(0.02, 0.18, 0.06), relief, "lions", [0, 0.25, z]));
    lion.position.x = x;
    group.add(lion);
  }
  // a gabled lid with corner acroteria, lifted when open
  const lid = new THREE.Group();
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-D / 2 - 0.04, 0); gableShape.lineTo(D / 2 + 0.04, 0); gableShape.lineTo(0, 0.26); gableShape.lineTo(-D / 2 - 0.04, 0);
  const lg = new THREE.ExtrudeGeometry(gableShape, { depth: L + 0.08, bevelEnabled: false });
  lg.translate(0, 0, -(L + 0.08) / 2); lg.rotateY(Math.PI / 2);
  lid.add(mesh(lg, stoneMat("#d0be97"), "lid"));
  lid.add(mesh(new THREE.BoxGeometry(L + 0.08, 0.07, D + 0.08), stoneMat("#d0be97"), "lid", [0, -0.035, 0]));
  for (const x of [-L / 2 - 0.02, L / 2 + 0.02]) for (const z of [-D / 2 - 0.02, D / 2 + 0.02]) lid.add(mesh(new THREE.BoxGeometry(0.16, 0.2, 0.14), relief, "acroteria", [x, 0.08, z]));
  lid.position.y = H + 0.07;
  if (open) { lid.position.set(0, H + 0.65, -0.55); lid.rotation.x = -0.35; }
  group.add(lid);
  // inside: a whole body — the primary burial the sarcophagus was for
  if (open) {
    const bone = stoneMat("#efe5cc", { roughness: 0.6 });
    const body = new THREE.Group();
    body.add(mesh(new THREE.SphereGeometry(0.1, 16, 12), bone, "body", [0.72, 0, 0]));
    body.add(mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 12).rotateZ(Math.PI / 2), bone, "body", [0.33, 0, 0]));
    for (const z of [-0.08, 0.08]) body.add(mesh(new THREE.CapsuleGeometry(0.045, 0.75, 6, 10).rotateZ(Math.PI / 2), bone, "body", [-0.33, 0, z]));
    body.position.y = 0.2;
    group.add(body);
  }
  if (compare) {
    const oss = new THREE.Group();
    oss.add(mesh(new THREE.BoxGeometry(0.6, 0.32, 0.29), stoneMat("#d4c4a1"), "ossuary", [0, 0.16, 0]));
    oss.add(mesh(new THREE.BoxGeometry(0.62, 0.05, 0.31), stoneMat("#cdbd98"), "ossuary", [0, 0.345, 0]));
    oss.position.set(L / 2 + 0.75, 0, 0.2);
    group.add(oss);
  }
  group.add(mesh(new THREE.BoxGeometry(L + 2.4, 0.04, D + 1.6), m.stone(), "ground", [0.5, -0.02, 0]));
  return { group, view: [0.65, 0.6, 1] };
}

export const BUILDERS3: Record<ModelId3, (m: Mats, o: ModelOptions) => Built> = {
  ossuary: buildOssuary,
  sarcophagus: buildSarcophagus,
};
