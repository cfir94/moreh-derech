/**
 * The second set of models: one for every chapter that the first four did
 * not cover. Same conventions as models1 — each mesh is tagged with the part
 * id that the chapter's 2D drawing already explains.
 */
import * as THREE from "three";
import { gable, mesh, simpleColumn, type Built, type Mats, type ModelOptions } from "./kit";

export type ModelId2 = "arch" | "road" | "theatre" | "hippodrome" | "bath" | "mikveh" | "cave" | "synagogue" | "basilica";

/* ---------------- small helpers ---------------- */

function textTexture(lines: string[], opts: { w?: number; h?: number; bg?: string; ink?: string; font?: string } = {}) {
  const { w = 512, h = 128, bg = "#e9dfcb", ink = "#3a2c1e", font = "bold 34px Georgia, serif" } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ink; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  lines.forEach((line, i) => ctx.fillText(line, w / 2, (h / (lines.length + 1)) * (i + 1)));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function solid(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
}

/** A rectangle with round-headed openings, extruded — arches, doors, windows. */
function pierced(width: number, height: number, depth: number, openings: { x: number; w: number; h: number; y?: number }[], mat: THREE.Material, part: string) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, height); s.lineTo(-width / 2, height); s.lineTo(-width / 2, 0);
  for (const o of openings) {
    const y0 = o.y ?? 0, spring = y0 + o.h - o.w / 2;
    const p = new THREE.Path();
    p.moveTo(o.x - o.w / 2, y0); p.lineTo(o.x + o.w / 2, y0); p.lineTo(o.x + o.w / 2, spring);
    p.absarc(o.x, spring, o.w / 2, 0, Math.PI, false);
    p.lineTo(o.x - o.w / 2, y0);
    s.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, mat, part);
}

/** A ring sector (seats, apses) extruded upward. Angles in radians, 0 = +x, counter-clockwise seen from above. */
function sector(r1: number, r2: number, a0: number, a1: number, height: number, mat: THREE.Material, part: string, y = 0) {
  const s = new THREE.Shape();
  s.moveTo(Math.cos(a0) * r2, Math.sin(a0) * r2);
  s.absarc(0, 0, r2, a0, a1, false);
  s.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
  s.absarc(0, 0, r1, a1, a0, true);
  const geo = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 48 });
  geo.rotateX(-Math.PI / 2);
  const m = mesh(geo, mat, part);
  m.position.y = y;
  return m;
}

function apse(radius: number, height: number, mat: THREE.Material, part: string) {
  const g = new THREE.Group();
  const wall = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true, 0, Math.PI);
  const wallMat = (mat as THREE.MeshStandardMaterial).clone(); wallMat.side = THREE.DoubleSide;
  g.add(mesh(wall, wallMat, part, [0, height / 2, 0]));
  const dome = new THREE.SphereGeometry(radius, 32, 12, 0, Math.PI, 0, Math.PI / 2);
  g.add(mesh(dome, wallMat, part, [0, height, 0]));
  return g;
}

/* ---------------- III. triumphal arch ---------------- */

function buildArch(m: Mats): Built {
  const group = new THREE.Group();
  const stone = { central: m.stone(), side: m.stone(), pedestal: m.marble(), column: m.marble(), inscription: m.stone() };
  const W = 16, H = 11, D = 5;
  const body = pierced(W, H, D, [{ x: 0, w: 5, h: 8 }, { x: -5.4, w: 2.4, h: 4.8 }, { x: 5.4, w: 2.4, h: 4.8 }], stone.central, "central");
  group.add(body);
  // tag the side openings' surroundings separately with thin frames
  for (const x of [-5.4, 5.4]) {
    const frame = new THREE.TorusGeometry(1.35, 0.14, 8, 24, Math.PI);
    group.add(mesh(frame, stone.side, "side", [x, 4.8 - 1.2, D / 2 + 0.08]));
    group.add(mesh(frame.clone(), stone.side, "side", [x, 4.8 - 1.2, -D / 2 - 0.08]));
  }
  group.add(mesh(new THREE.TorusGeometry(2.65, 0.22, 8, 32, Math.PI), stone.central, "central", [0, 8 - 2.5, D / 2 + 0.1]));
  for (const z of [D / 2 + 0.9, -D / 2 - 0.9]) for (const x of [-7.4, -3.2, 3.2, 7.4]) {
    group.add(mesh(new THREE.BoxGeometry(1.5, 2.2, 1.5), stone.pedestal, "pedestal", [x, 1.1, z]));
    const c = simpleColumn(stone.column, 7, 0.45, "column", true);
    c.position.set(x, 2.2, z);
    group.add(c);
  }
  group.add(mesh(new THREE.BoxGeometry(W + 0.6, 0.7, D + 2.6), m.stone(), "central", [0, H + 0.35 - 0.2, 0]));
  const attic = mesh(new THREE.BoxGeometry(W - 1, 3.4, D), stone.inscription, "inscription", [0, H + 1.9, 0]);
  group.add(attic);
  const plaque = new THREE.MeshStandardMaterial({ map: textTexture(["IMP · CAES · HADRIANO", "COL · AEL · CAPITOLINA"], { bg: "#d9cdb4" }), roughness: 0.8 });
  for (const z of [D / 2 + 0.02, -D / 2 - 0.02]) {
    const p = mesh(new THREE.PlaneGeometry(10, 2.4), plaque, "inscription", [0, H + 1.9, z]);
    if (z < 0) p.rotation.y = Math.PI;
    group.add(p);
  }
  const road = mesh(new THREE.PlaneGeometry(10, 40), m.sand(), "ground");
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  group.add(road);
  return { group };
}

/* ---------------- IV. road and milestone ---------------- */

function buildRoad(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const L = 14;
  const layers: [string, number, string][] = [["bedding", 0.9, "#8c7f6a"], ["gravel", 0.6, "#a8997f"], ["fill", 0.35, "#c9b993"]];
  let y = 0;
  for (const [part, h, color] of layers) {
    group.add(mesh(new THREE.BoxGeometry(L, h, 7), solid(color), part, [0, y + h / 2, 0]));
    if (part === "bedding") for (let i = 0; i < 26; i++) group.add(mesh(new THREE.SphereGeometry(0.32, 8, 6), solid("#6e6352"), "bedding", [-L / 2 + 0.3 + (i % 13) * 1.05, 0.35 + Math.floor(i / 13) * 0.3, 3.52]));
    y += h;
  }
  const paveMat = solid("#7b7d80", { roughness: 0.65 });
  const rand = (i: number) => (Math.sin(i * 91.7) + 1) / 2;
  for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) {
    const lift = 0.18 - Math.abs(j - 2.5) * 0.05;
    const stoneGeo = new THREE.CylinderGeometry(0.62 + rand(i * 7 + j) * 0.12, 0.66, 0.32 + lift, 6);
    const s = mesh(stoneGeo, paveMat, "paving", [-L / 2 + 0.75 + i * 1.38 + (j % 2) * 0.69, y + 0.16 + lift / 2, -2.75 + j * 1.1]);
    s.rotation.y = rand(i + j * 13) * Math.PI;
    group.add(s);
  }
  for (const z of [-3.6, 3.6]) group.add(mesh(new THREE.BoxGeometry(L, 0.75, 0.45), solid("#9a9389"), "curb", [0, y + 0.25, z]));
  for (const z of [-4.6, 4.6]) group.add(mesh(new THREE.BoxGeometry(L, 0.15, 1.3), solid("#4f7aa0", { roughness: 0.2 }), "ditch", [0, 0.6, z]));
  const miles = Number(o.miles ?? 7);
  const numeral = (() => { let n = miles, out = ""; for (const [v, g] of [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]] as [number, string][]) while (n >= v) { out += g; n -= v; } return out; })();
  const stoneMat = new THREE.MeshStandardMaterial({ map: textTexture(["IMP · CAES", "TRAIANO", `M · P · ${numeral}`], { w: 512, h: 512, bg: "#cfc4ad", font: "bold 60px Georgia, serif" }), roughness: 0.85 });
  const ms = mesh(new THREE.CylinderGeometry(0.5, 0.55, 3.2, 32), stoneMat, "milestone", [3.5, y + 1.9, 5.6]);
  ms.rotation.y = -Math.PI / 2;
  group.add(ms);
  group.add(mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), solid("#a39983"), "milestone", [3.5, y + 0.15, 5.6]));
  return { group };
}

/* ---------------- VI. Roman theatre ---------------- */

function buildTheatre(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const seat = { ima: m.stone(), media: m.stone(), summa: m.stone() };
  const full = Boolean(o.fullScaena);
  const r0 = 6, step = 0.85, rise = 0.42;
  const bands: [keyof typeof seat, number, number][] = [["ima", 0, 9], ["media", 10, 17], ["summa", 18, 24]];
  for (const [part, from, to] of bands) for (let i = from; i <= to; i++) group.add(sector(r0 + i * step, r0 + (i + 1) * step, 0, Math.PI, (i + 1) * rise, seat[part], part));
  // walkways (praecinctiones) as darker treads
  for (const i of [9.5, 17.5]) group.add(sector(r0 + i * step, r0 + (i + 0.5) * step, 0, Math.PI, (i + 0.6) * rise, solid("#8a7a62"), "media"));
  const outer = r0 + 25 * step;
  const ambMat = m.stone(); ambMat.side = THREE.DoubleSide;
  group.add(mesh(new THREE.CylinderGeometry(outer + 0.6, outer + 0.6, 25 * rise + 1.2, 64, 1, true, Math.PI / 2, Math.PI), ambMat, "ambulacrum", [0, (25 * rise + 1.2) / 2, 0]));
  for (let k = 0; k < 9; k++) {
    const a = (Math.PI * (k + 0.5)) / 9;
    const door = mesh(new THREE.BoxGeometry(1.2, 2.2, 0.3), solid("#2b241d"), "ambulacrum", [Math.cos(a) * (outer + 0.62), 1.2, -Math.sin(a) * (outer + 0.62)]);
    door.lookAt(0, 1.2, 0);
    group.add(door);
  }
  for (const a of [Math.PI / 5, (2 * Math.PI) / 5, (3 * Math.PI) / 5, (4 * Math.PI) / 5]) {
    const r = r0 + 13.6 * step;
    const v = mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), solid("#231d17"), "vomitorium", [Math.cos(a) * r, 13.6 * rise + 0.4, -Math.sin(a) * r]);
    v.lookAt(0, v.position.y, 0);
    group.add(v);
  }
  const orch = new THREE.CircleGeometry(r0, 48, 0, Math.PI);
  orch.rotateX(-Math.PI / 2);
  group.add(mesh(orch, m.marble(), "orchestra", [0, 0.02, 0]));
  group.add(mesh(new THREE.BoxGeometry(2 * r0 + 10, 1.4, 4.2), m.stone(), "pulpitum", [0, 0.7, 2.6]));
  group.add(mesh(new THREE.BoxGeometry(2 * r0 + 10, 1.4, 0.3), solid("#bfae8f"), "proscaenium", [0, 0.7, 0.45]));
  for (const x of [-(r0 + 6), r0 + 6]) group.add(mesh(new THREE.BoxGeometry(4.5, 3.2, 3.6), solid("#a2917a"), "aditus", [x, 1.6, -1.2]));
  const scH = full ? 16 : 4.5;
  const scaena = pierced(2 * r0 + 12, scH, 1.4, [{ x: 0, w: 2.8, h: 4.2 }, { x: -6, w: 2, h: 3.6 }, { x: 6, w: 2, h: 3.6 }], m.stone(), "scaenae");
  scaena.position.set(0, 1.4, 5.4);
  group.add(scaena);
  if (full) for (const tier of [0, 1]) for (const x of [-9, -7, -4.5, -1.6, 1.6, 4.5, 7, 9]) {
    const c = simpleColumn(m.marble(), 5.6, 0.28, "scaenae", true);
    c.position.set(x, 1.4 + tier * 6.6, 4.3);
    group.add(c);
  }
  return { group, view: [0.35, 0.75, -1] };
}

/* ---------------- VI. hippodrome ---------------- */

function buildHippodrome(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const converted = Boolean(o.converted);
  const L = 70, W = 22, R = W / 2;
  const sand = m.sand();
  const arena = new THREE.Shape();
  arena.moveTo(-L / 2, -R); arena.lineTo(L / 2 - R, -R); arena.absarc(L / 2 - R, 0, R, -Math.PI / 2, Math.PI / 2, false); arena.lineTo(-L / 2, R); arena.lineTo(-L / 2, -R);
  const ag = new THREE.ShapeGeometry(arena, 32); ag.rotateX(-Math.PI / 2);
  const floor = mesh(ag, sand, "ground"); floor.position.y = 0.02; group.add(floor);
  const seats = m.stone();
  for (let i = 0; i < 6; i++) {
    const h = (i + 1) * 0.55, r1 = R + 0.5 + i * 1.1, r2 = r1 + 1.1;
    group.add(sector(r1, r2, -Math.PI / 2, Math.PI / 2, h, seats, "seats").translateX(L / 2 - R));
    for (const z of [r1 + 0.55, -(r1 + 0.55)]) group.add(mesh(new THREE.BoxGeometry(L - R, h, 1.1), seats, "seats", [-R / 2, h / 2, z]));
  }
  group.add(mesh(new THREE.BoxGeometry(5, 4.4, 2.6), solid("#c9a46a"), "seats", [-2, 2.2, -(R + 4.4)]));
  for (let i = 0; i < 12; i++) group.add(mesh(new THREE.BoxGeometry(1.4, 3, 1.6), solid("#6d5a45"), "carceres", [-L / 2 - 0.7, 1.5, -R + 0.9 + i * 1.75]));
  const spina = mesh(new THREE.BoxGeometry(L * 0.58, 1, 1.6), m.marble(), "spina", [-2, 0.5, 0]);
  group.add(spina);
  const obelisk = mesh(new THREE.CylinderGeometry(0.15, 0.45, 6, 4), m.marble(), "spina", [-2, 4, 0]);
  group.add(obelisk);
  const metaMat = m.gold();
  for (const [x, part] of [[L * 0.29 - 2 + 1, "metaPrima"], [-L * 0.29 - 2 - 1, "metaSecunda"]] as [number, string][]) for (const dz of [-0.5, 0, 0.5]) group.add(mesh(new THREE.ConeGeometry(0.3, 2.4, 12), metaMat, part, [x, 1.2, dz]));
  const dolphins: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const d = mesh(new THREE.ConeGeometry(0.22, 0.9, 8), m.gold(), "counter", [-8 + i * 1.4, 1.4, 0]);
    d.rotation.z = Math.PI / 2;
    dolphins.push(d);
    group.add(d);
  }
  if (converted) {
    group.add(mesh(new THREE.BoxGeometry(1, 3.4, W), m.stone(), "wall", [6, 1.7, 0]));
    for (let i = 0; i < 18; i++) group.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), solid("#5a4630"), "wall", [8 + i * 1.6, 1.1, R - 0.3]));
  }
  // a chariot running anticlockwise around the spina
  const chariot = new THREE.Group();
  chariot.add(mesh(new THREE.BoxGeometry(1.2, 0.8, 1), solid("#9b2d1f"), "chariot"));
  for (const z of [-0.6, 0.6]) { const w = mesh(new THREE.TorusGeometry(0.4, 0.07, 6, 16), solid("#3a2a1a"), "chariot", [0, -0.1, z]); chariot.add(w); }
  for (const z of [-0.45, 0.45]) chariot.add(mesh(new THREE.BoxGeometry(1.8, 0.9, 0.45), solid("#5a3d24"), "chariot", [-2, 0.2, z]));
  chariot.position.y = 0.5;
  if (!converted) group.add(chariot);
  const a = L * 0.29 + 1, b = 6.2;
  return {
    group,
    tick: (t) => {
      if (converted) return;
      const lapT = 9, lap = Math.floor(t / lapT) % 8, f = (t % lapT) / lapT;
      const ang = f * Math.PI * 2;
      chariot.position.set(-2 + Math.cos(ang) * a, 0.5, Math.sin(ang) * b);
      chariot.rotation.y = -Math.atan2(Math.cos(ang) * b, -Math.sin(ang) * a);
      dolphins.forEach((d, i) => { d.rotation.x = i < lap ? Math.PI : 0; });
    },
  };
}

/* ---------------- VII. bath ---------------- */

function buildBath(m: Mats): Built {
  const group = new THREE.Group();
  const wall = m.stone();
  const rooms: [string, number, number, number][] = [["palaestra", -16, 7, 0], ["apodyterium", -9, 5, 3.6], ["frigidarium", -3.5, 5.6, 4.4], ["tepidarium", 2.2, 5.2, 4.6], ["caldarium", 8, 6.4, 5.4]];
  const D = 7;
  group.add(mesh(new THREE.BoxGeometry(34, 0.3, D + 2), solid("#8d7f68"), "ground", [-3, -0.15, 0]));
  // hypocaust under the warm rooms
  const hypoX0 = -0.4, hypoX1 = 11.2;
  group.add(mesh(new THREE.BoxGeometry(hypoX1 - hypoX0, 0.2, D), solid("#7a6a55"), "hypocaust", [(hypoX0 + hypoX1) / 2, 0.1, 0]));
  for (let x = hypoX0 + 0.5; x < hypoX1; x += 0.9) for (let z = -D / 2 + 0.5; z < D / 2; z += 0.9) group.add(mesh(new THREE.BoxGeometry(0.35, 1, 0.35), solid("#a0522d"), "hypocaust", [x, 0.7, z]));
  for (const [part, x, w, h] of rooms) {
    const raised = part === "tepidarium" || part === "caldarium";
    const base = raised ? 1.2 : 0;
    if (raised) group.add(mesh(new THREE.BoxGeometry(w, 0.2, D), m.marble(), part, [x, 1.3, 0]));
    else if (part !== "palaestra") group.add(mesh(new THREE.BoxGeometry(w, 0.2, D), m.marble(), part, [x, 0.1, 0]));
    if (part === "palaestra") {
      group.add(mesh(new THREE.BoxGeometry(w, 0.1, D), m.sand(), part, [x, 0.05, 0]));
      for (const zx of [-2.6, 0, 2.6]) for (const z of [-D / 2 + 0.4, D / 2 - 0.4]) { const c = simpleColumn(m.marble(), 3, 0.18, part); c.position.set(x + zx, 0.1, z); group.add(c); }
      continue;
    }
    group.add(mesh(new THREE.BoxGeometry(w, h, 0.3), wall, part, [x, base + 0.2 + h / 2, -D / 2]));
    group.add(mesh(new THREE.BoxGeometry(0.3, h, D), wall, part, [x - w / 2, base + 0.2 + h / 2, 0]));
    if (part === "apodyterium") for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) group.add(mesh(new THREE.BoxGeometry(0.8, 0.7, 0.2), solid("#3d3226"), part, [x - 1.6 + c * 1.05, 1 + r * 1, -D / 2 + 0.2]));
    if (part === "frigidarium") group.add(mesh(new THREE.BoxGeometry(3.4, 0.5, 3), solid("#5aa0d4", { roughness: 0.15, transparent: true, opacity: 0.85 }), part, [x, 0.35, 0.6]));
    if (part === "caldarium") group.add(mesh(new THREE.BoxGeometry(4, 0.5, 2.6), solid("#d9784b", { roughness: 0.2, transparent: true, opacity: 0.85 }), part, [x, 1.6, 1]));
  }
  // furnace with a flickering fire
  group.add(mesh(new THREE.BoxGeometry(2.2, 2.2, 2.6), solid("#4a3b2c"), "furnace", [12.5, 1.1, 0]));
  const fire = new THREE.MeshStandardMaterial({ color: "#ff7a2f", emissive: new THREE.Color("#ff5a1a"), emissiveIntensity: 1.6 });
  const flame = mesh(new THREE.ConeGeometry(0.5, 1.1, 10), fire, "furnace", [11.35, 0.6, 0]);
  group.add(flame);
  const glow = new THREE.PointLight("#ff7a2f", 6, 9);
  glow.position.set(10.8, 0.8, 0);
  group.add(glow);
  // hot air under the floor and steam over the hot pool
  const airMat = new THREE.MeshBasicMaterial({ color: "#ff8c42", transparent: true, opacity: 0.8 });
  const air = Array.from({ length: 14 }, (_, i) => { const p = mesh(new THREE.SphereGeometry(0.12, 8, 6), airMat, "hypocaust", [0, 0.7, -2.5 + (i % 5) * 1.2]); group.add(p); return p; });
  const steamMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.3, depthWrite: false });
  const steam = Array.from({ length: 10 }, (_, i) => { const s = mesh(new THREE.SphereGeometry(0.45, 10, 8), steamMat.clone(), "caldarium", [8 + (i % 5 - 2) * 0.7, 2, 1 + (i % 2) * 0.6]); s.castShadow = false; group.add(s); return s; });
  return {
    group,
    tick: (t) => {
      flame.scale.y = 1 + 0.25 * Math.sin(t * 13) + 0.1 * Math.sin(t * 29);
      glow.intensity = 5 + 1.5 * Math.sin(t * 17);
      air.forEach((p, i) => { p.position.x = 11 - ((t * 2.2 + i * 0.83) % 11.4); });
      steam.forEach((s, i) => { const k = (t * 0.35 + i / 10) % 1; s.position.y = 2 + k * 3.2; s.scale.setScalar(0.6 + k * 1.2); (s.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - k); });
    },
  };
}

/* ---------------- IX. mikveh ---------------- */

const MIKVEH_WATER: Record<string, string> = { clean: "#4b9fd6", dirty: "#7a6a3e", drawn: "#9aa6ad", kosher: "#4b9fd6" };

function buildMikveh(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const state = String(o.water ?? "clean");
  const rock = m.stone();
  const W = 4, steps = 8, stepH = 0.42, stepD = 0.7;
  // stepped descent, cut away on the near side so the section reads
  for (let i = 0; i < steps; i++) group.add(mesh(new THREE.BoxGeometry(W, (steps - i) * stepH, stepD), rock, "steps", [0, ((steps - i) * stepH) / 2 - steps * stepH, -i * stepD]));
  const poolD = 2.4, poolZ = -steps * stepD - poolD / 2 + stepD / 2;
  group.add(mesh(new THREE.BoxGeometry(W, 0.3, poolD), rock, "pool", [0, -steps * stepH - 0.15, poolZ]));
  const divider = mesh(new THREE.BoxGeometry(0.12, 0.14, Math.hypot(steps * stepD, steps * stepH)), solid("#b4532a"), "divider");
  divider.rotation.x = -Math.atan2(stepH, stepD);
  divider.position.set(0, -steps * stepH / 2 + 0.12, -(steps - 1) * stepD / 2);
  group.add(divider);
  for (const x of [-W / 2 - 0.3]) group.add(mesh(new THREE.BoxGeometry(0.6, steps * stepH + 0.6, steps * stepD + poolD + 0.6), rock, "pool", [x, -steps * stepH / 2 + 0.1, -(steps * stepD + poolD) / 2 + 0.6]));
  group.add(mesh(new THREE.BoxGeometry(W + 1.2, steps * stepH + 0.6, 0.6), rock, "pool", [0, -steps * stepH / 2 + 0.1, poolZ - poolD / 2 - 0.3]));
  const waterMat = new THREE.MeshStandardMaterial({ color: MIKVEH_WATER[state] ?? MIKVEH_WATER.clean, transparent: true, opacity: 0.75, roughness: 0.1 });
  const level = -steps * stepH + 1.7;
  group.add(mesh(new THREE.BoxGeometry(W, 1.7, poolD + 2.6), waterMat, "water", [0, level - 0.85, poolZ + 1.3]));
  // the otzar beside it, joined by a pipe and a plug
  const ox = -W / 2 - 2.4;
  group.add(mesh(new THREE.BoxGeometry(2.6, 0.3, 2.6), rock, "otzar", [ox, -steps * stepH - 0.15, poolZ]));
  for (const dx of [-1.45, 1.45]) group.add(mesh(new THREE.BoxGeometry(0.3, steps * stepH, 2.6), rock, "otzar", [ox + dx, -steps * stepH / 2, poolZ]));
  group.add(mesh(new THREE.BoxGeometry(2.6, 1.7, 2.6), new THREE.MeshStandardMaterial({ color: "#4b9fd6", transparent: true, opacity: 0.75, roughness: 0.1 }), "otzar", [ox, level - 0.85, poolZ]));
  const pipe = new THREE.CylinderGeometry(0.16, 0.16, 1.6, 16); pipe.rotateZ(Math.PI / 2);
  group.add(mesh(pipe, solid("#6b5a45"), "pipe", [-W / 2 - 0.6, -steps * stepH + 0.4, poolZ]));
  if (state !== "kosher") group.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 16).rotateZ(Math.PI / 2), solid("#c9a46a"), "pipe", [-W / 2 - 0.3, -steps * stepH + 0.4, poolZ]));
  return { group, view: [1, 0.75, 0.55] };
}

/* ---------------- X. burial cave ---------------- */

function rosetteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d8c9a8"; ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = "#7a6446"; ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 240, 112);
  for (const cx of [64, 192]) {
    ctx.beginPath(); ctx.arc(cx, 64, 40, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 20, 64 + Math.sin(a) * 20, 18, 7, a, 0, Math.PI * 2); ctx.stroke(); }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildCave(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const phase = Number(o.phase ?? 0);
  const rock = new THREE.MeshStandardMaterial({ color: "#a8957a", roughness: 0.95 });
  const dark = solid("#2a221b");
  const S = 6, H = 2.4;
  group.add(mesh(new THREE.BoxGeometry(S + 6, 0.4, S + 6), rock, "bench", [0, -0.2, 0]));
  // benches around a sunken standing pit
  group.add(mesh(new THREE.BoxGeometry(S, 0.6, S), rock, "bench", [0, 0.3, 0]));
  group.add(mesh(new THREE.BoxGeometry(S - 2, 0.62, S - 1.2), dark, "pit", [0, 0.31, 0.6]));
  // walls with kokhim cut into them: back wall (−z) and left wall (−x)
  const wallT = 0.6;
  const kokh = (x: number, z: number, rotY: number, len: number, part: string) => {
    const k = new THREE.Group();
    k.add(mesh(new THREE.BoxGeometry(0.8, 0.85, len), dark, part, [0, 0.42, -len / 2]));
    k.add(mesh(new THREE.BoxGeometry(1.4, 0.9, len), rock, part, [0, 1.3, -len / 2]));
    k.position.set(x, 0.6, z);
    k.rotation.y = rotY;
    return k;
  };
  for (const x of [-1.8, 0, 1.8]) group.add(kokh(x, -S / 2, 0, 2.2, "kokh"));
  for (const z of [-1.6, 0.2]) group.add(kokh(-S / 2, z, Math.PI / 2, 2.2, "kokh"));
  group.add(kokh(-S / 2, 1.9, Math.PI / 2, 0.9, "smallKokh"));
  // wall fill between the niches
  for (const x of [-2.75, -0.9, 0.9, 2.75]) group.add(mesh(new THREE.BoxGeometry(x === -2.75 || x === 2.75 ? 0.5 : 1, H, wallT), rock, "bench", [x, 0.6 + H / 2 - 0.6, -S / 2 - wallT / 2]));
  group.add(mesh(new THREE.BoxGeometry(S, H - 1.45, wallT), rock, "bench", [0, 0.6 + 1.45 + (H - 1.45) / 2 - 0.6, -S / 2 - wallT / 2]));
  // the arcosolium on the right wall
  const arcoWall = pierced(S, H, wallT, [{ x: 0, w: 2.4, h: 1.9, y: 0.25 }], rock, "arcosolium");
  arcoWall.rotation.y = -Math.PI / 2;
  arcoWall.position.set(S / 2 + wallT / 2, 0.6 - 0.6, 0);
  group.add(arcoWall);
  group.add(mesh(new THREE.BoxGeometry(1.4, 0.3, 2.3), rock, "arcosolium", [S / 2 + 0.75, 0.6, 0]));
  // body, bones and the ossuary follow the phases
  const body = solid("#c8b089");
  if (phase < 2) group.add(mesh(new THREE.CapsuleGeometry(0.22, 1.4, 6, 12).rotateX(Math.PI / 2), body, "kokh", [0, 1.1, -S / 2 - 1.1]));
  if (phase === 2) for (let i = 0; i < 5; i++) group.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6).rotateZ(Math.PI / 2).rotateY(i), solid("#efe4c8"), "kokh", [-0.2 + i * 0.1, 1.07, -S / 2 - 1.1 - i * 0.12]));
  const ossMat = [solid("#cdbd9b"), solid("#cdbd9b"), solid("#cdbd9b"), solid("#cdbd9b"), new THREE.MeshStandardMaterial({ map: rosetteTexture(), roughness: 0.8 }), solid("#cdbd9b")];
  const ossuary = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.34), ossMat);
  ossuary.userData.part = "ossuary"; ossuary.castShadow = true;
  if (phase === 3) { ossuary.position.set(-S / 2 - 0.45, 1.05, 1.9); ossuary.rotation.y = Math.PI / 2; } else ossuary.position.set(1.6, 0.81, 2.2);
  group.add(ossuary);
  group.add(mesh(new THREE.BoxGeometry(2.1, 0.8, 0.8), m.stone(), "sarcophagus", [1.2, 1.0, -1.6]));
  group.add(mesh(new THREE.BoxGeometry(2.2, 0.15, 0.9), m.stone(), "sarcophagus", [1.2, 1.47, -1.6]));
  const torch = new THREE.PointLight("#ffb05a", 7, 12);
  torch.position.set(0.8, 2.4, 2.4);
  group.add(torch);
  return { group, view: [0.45, 1.3, 0.9], tick: (t) => { torch.intensity = 6 + Math.sin(t * 9) * 0.8 + Math.sin(t * 23) * 0.4; } };
}

/* ---------------- XI. Galilean synagogue ---------------- */

function buildSynagogue(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const cut = Boolean(o.cutaway ?? true);
  const lime = m.marble();
  const W = 14, L = 18, H = 8;
  group.add(mesh(new THREE.BoxGeometry(W + 6, 0.6, L + 2), m.stone(), "terrace", [0, 0.3, 0]));
  group.add(mesh(new THREE.BoxGeometry(W, 0.12, L), solid("#d9cdb4"), "hall", [0, 0.66, 0]));
  // the facade with three doors faces south — towards Jerusalem (+z here)
  const facade = pierced(W, H, 0.8, [{ x: 0, w: 2.4, h: 4.2 }, { x: -4, w: 1.6, h: 3.2 }, { x: 4, w: 1.6, h: 3.2 }], lime, "facade");
  facade.position.set(0, 0.6, L / 2);
  group.add(facade);
  const peak = gable(W, 2.4, 0.8, lime, "facade"); peak.position.set(0, H + 0.6, L / 2); group.add(peak);
  for (const x of [-W / 2, W / 2]) group.add(mesh(new THREE.BoxGeometry(0.8, H, L), lime, "hall", [x, 0.6 + H / 2, 0]));
  group.add(mesh(new THREE.BoxGeometry(W, H, 0.8), lime, "hall", [0, 0.6 + H / 2, -L / 2]));
  for (let i = 0; i < 2; i++) for (const side of [-1, 1]) group.add(mesh(new THREE.BoxGeometry(0.7, 0.45 + i * 0.45, L - 2), m.stone(), "benches", [side * (W / 2 - 0.75 - i * 0.7), 0.85 + i * 0.2, 0]));
  // columns on three sides: two long rows and one across the back
  for (let k = 0; k < 7; k++) for (const x of [-W / 2 + 3, W / 2 - 3]) { const c = simpleColumn(lime, 5.2, 0.32, "columns", true); c.position.set(x, 0.66, L / 2 - 2.5 - k * 2.2); group.add(c); }
  for (const x of [-1.4, 1.4]) { const c = simpleColumn(lime, 5.2, 0.32, "columns", true); c.position.set(x, 0.66, -L / 2 + 2.5); group.add(c); }
  if (!cut) { const roof = gable(W + 1, 2.4, L, m.roof(), "hall"); roof.position.set(0, H + 0.6, 0); group.add(roof); }
  // an arrow pointing the way to Jerusalem
  const arrowMat = new THREE.MeshStandardMaterial({ color: "#d4a33b", emissive: new THREE.Color("#a3721a"), emissiveIntensity: 0.4 });
  const shaft = new THREE.CylinderGeometry(0.18, 0.18, 4, 12); shaft.rotateX(Math.PI / 2);
  group.add(mesh(shaft, arrowMat, "direction", [0, 1, L / 2 + 4.5]));
  const head = new THREE.ConeGeometry(0.55, 1.2, 16); head.rotateX(Math.PI / 2);
  group.add(mesh(head, arrowMat, "direction", [0, 1, L / 2 + 7]));
  return { group, view: [0.55, 1.15, 0.9] };
}

/* ---------------- XII. basilica church (Kursi) ---------------- */

function buildBasilica(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const cut = Boolean(o.cutaway ?? true);
  const wall = m.stone();
  const L = 26, nave = 7, aisle = 4, W = nave + 2 * aisle, Hn = 11, Ha = 6;
  // church runs west (−x) to east (+x)
  group.add(mesh(new THREE.BoxGeometry(L, 0.3, W), m.sand(), "nave", [0, 0.15, 0]));
  const mosaic = mesh(new THREE.PlaneGeometry(L - 4, nave - 1), new THREE.MeshStandardMaterial({ map: textTexture(["✦ ✧ ✦ ✧ ✦ ✧ ✦"], { w: 512, h: 128, bg: "#b9874f", ink: "#f3e3c2", font: "64px serif" }), roughness: 0.9 }), "nave", [-1, 0.32, 0]);
  mosaic.rotation.x = -Math.PI / 2;
  group.add(mosaic);
  for (const z of [-W / 2, W / 2]) group.add(mesh(new THREE.BoxGeometry(L, Ha, 0.5), wall, "aisles", [0, Ha / 2, z]));
  for (const z of [-nave / 2, nave / 2]) {
    group.add(mesh(new THREE.BoxGeometry(L - 4, 0.3, 0.9), m.marble(), "stylobates", [-1, 0.45, z]));
    for (let i = 0; i < 9; i++) { const c = simpleColumn(m.marble(), 5.4, 0.32, "stylobates", true); c.position.set(-L / 2 + 2.5 + i * 2.6, 0.6, z); group.add(c); }
    // clerestory walls above the colonnades, pierced by windows
    const clere = pierced(L - 4, Hn - 6.4, 0.4, Array.from({ length: 7 }, (_, i) => ({ x: -(L - 4) / 2 + 2 + i * 3.3, w: 1.1, h: 2, y: 1.6 })), wall, "nave");
    clere.position.set(-1, 6.4, z);
    group.add(clere);
  }
  if (!cut) {
    const roofN = gable(nave + 0.8, 2.2, L - 4, m.roof(), "nave"); roofN.rotation.y = Math.PI / 2; roofN.position.set(-1, Hn, 0); group.add(roofN);
    for (const side of [-1, 1]) { const r = mesh(new THREE.BoxGeometry(L - 4, 0.3, aisle + 0.6), m.roof(), "aisles", [-1, Ha + 0.25, side * (nave / 2 + aisle / 2)]); r.rotation.x = side * 0.22; group.add(r); }
  }
  // the east end: three apses
  const east = L / 2 - 2;
  group.add(mesh(new THREE.BoxGeometry(2.4, 0.6, nave), m.marble(), "bema", [east - 1.4, 0.6, 0]));
  group.add(mesh(new THREE.BoxGeometry(0.2, 1.1, nave), solid("#e8dcc3"), "bema", [east - 2.7, 1.2, 0]));
  const a1 = apse(nave / 2, Hn - 2, wall, "apse"); a1.rotation.y = -Math.PI / 2; a1.position.set(east, 0.3, 0); group.add(a1);
  const a2 = apse(aisle / 2 - 0.2, Ha - 1.5, wall, "prothesis"); a2.rotation.y = -Math.PI / 2; a2.position.set(east, 0.3, -(nave / 2 + aisle / 2)); group.add(a2);
  const a3 = apse(aisle / 2 - 0.2, Ha - 1.5, wall, "diaconicon"); a3.rotation.y = -Math.PI / 2; a3.position.set(east, 0.3, nave / 2 + aisle / 2); group.add(a3);
  // west: narthex and atrium with a cistern
  group.add(mesh(new THREE.BoxGeometry(3, Ha, W), m.stone(), "narthex", [-L / 2 - 1.5, Ha / 2, 0]));
  group.add(mesh(new THREE.BoxGeometry(12, 0.25, W + 2), m.sand(), "atrium", [-L / 2 - 9, 0.12, 0]));
  for (let i = 0; i < 5; i++) for (const z of [-W / 2 - 0.4, W / 2 + 0.4]) { const c = simpleColumn(m.marble(), 3.4, 0.22, "atrium"); c.position.set(-L / 2 - 4 - i * 2.4, 0.25, z); group.add(c); }
  group.add(mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 24), solid("#4b9fd6", { roughness: 0.2 }), "atrium", [-L / 2 - 9, 0.4, 0]));
  return { group, view: [0.35, 0.85, 1] };
}

export const BUILDERS2: Record<ModelId2, (m: Mats, o: ModelOptions) => Built> = {
  arch: buildArch,
  road: buildRoad,
  theatre: buildTheatre,
  hippodrome: buildHippodrome,
  bath: buildBath,
  mikveh: buildMikveh,
  cave: buildCave,
  synagogue: buildSynagogue,
  basilica: buildBasilica,
};
