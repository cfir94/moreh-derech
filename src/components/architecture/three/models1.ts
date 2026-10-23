/** The first four models: a column in each order, temples, the Pantheon and Caesarea's aqueduct. */
import * as THREE from "three";
import { gable, mesh, simpleColumn, statue, type Built, type Mats, type ModelOptions } from "./kit";

/* ---------------- column ---------------- */

type Order = "doric" | "ionic" | "corinthian";

function shaftGeometry(h: number, rb: number, rt: number, flutes: number, entasis: number, fillets: boolean) {
  const geo = new THREE.CylinderGeometry(1, 1, h, flutes * 8, 60, false);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const len = Math.hypot(x, z);
    if (len < 1e-6) { continue; }
    const t = (y + h / 2) / h;
    let r = rb + (rt - rb) * t + entasis * Math.sin(Math.PI * t);
    const theta = Math.atan2(z, x);
    const frac = (((theta / (Math.PI * 2)) * flutes) % 1 + 1) % 1;
    if (len > 0.99) {
      const depth = fillets
        ? (frac > 0.14 && frac < 0.86 ? 0.06 * Math.sin((Math.PI * (frac - 0.14)) / 0.72) : 0)
        : 0.055 * Math.sin(Math.PI * frac);
      r *= 1 - depth;
      pos.setXYZ(i, Math.cos(theta) * r, y, Math.sin(theta) * r);
    } else {
      pos.setXYZ(i, (x / len) * r * len, y, (z / len) * r * len);
    }
  }
  geo.computeVertexNormals();
  geo.translate(0, h / 2, 0);
  return geo;
}

function lathe(points: [number, number][], segments = 64) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

function spiral(cx: number, cy: number, z: number, r0: number, dir: number) {
  const pts: THREE.Vector3[] = [];
  for (let t = 0; t <= 3.2; t += 0.02) {
    const r = r0 * (1 - t / 3.5), a = dir * t * Math.PI * 2 + Math.PI / 2;
    pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.014, 6, false);
}

function leafGeometry(w: number, h: number, curl: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  const steps = 5;
  for (let i = 1; i <= steps; i++) { const y = (h * i) / steps; const x = (w / 2) * Math.sin((Math.PI * i) / (steps + 0.6)); s.lineTo(x + (i % 2 ? 0.03 : 0), y - (i % 2 ? 0.02 : 0)); }
  for (let i = steps; i >= 1; i--) { const y = (h * i) / steps; const x = (w / 2) * Math.sin((Math.PI * i) / (steps + 0.6)); s.lineTo(-x - (i % 2 ? 0.03 : 0), y - (i % 2 ? 0.02 : 0)); }
  s.lineTo(0, 0);
  const geo = new THREE.ShapeGeometry(s, 4);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, curl * Math.pow(y / h, 2.2)); }
  geo.computeVertexNormals();
  return geo;
}

function concaveAbacus(half: number, inset: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(-half, -half);
  s.quadraticCurveTo(0, -half + inset, half, -half);
  s.quadraticCurveTo(half - inset, 0, half, half);
  s.quadraticCurveTo(0, half - inset, -half, half);
  s.quadraticCurveTo(-half + inset, 0, -half, -half);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function buildColumn(m: Mats, o: ModelOptions): Built {
  const order = (o.order as Order) ?? "doric";
  const group = new THREE.Group();
  const marble = { stylobate: m.marble(), pedestal: m.marble(), base: m.marble(), shaft: m.marble(), capital: m.marble(), architrave: m.marble(), frieze: m.marble(), cornice: m.marble() };
  const dark = m.dark();
  const ratio = order === "doric" ? 5.5 : order === "ionic" ? 9 : 10;
  const rb = 0.5, rt = order === "doric" ? 0.39 : 0.43;
  const entasis = o.entasis ? 0.09 : 0.012;
  let y = 0;
  // stylobate: three steps
  for (let i = 0; i < 3; i++) group.add(mesh(new THREE.BoxGeometry(3.4 - i * 0.35, 0.18, 2.4 - i * 0.35), marble.stylobate, "stylobate", [0, y + 0.09 + i * 0.18, 0]));
  y = 0.54;
  if (o.pedestal) {
    group.add(mesh(new THREE.BoxGeometry(1.4, 1, 1.4), marble.pedestal, "pedestal", [0, y + 0.5, 0]));
    group.add(mesh(new THREE.BoxGeometry(1.55, 0.12, 1.55), marble.pedestal, "pedestal", [0, y + 1.06, 0]));
    y += 1.12;
  }
  if (order !== "doric") {
    group.add(mesh(new THREE.BoxGeometry(1.35, 0.12, 1.35), marble.base, "base", [0, y + 0.06, 0]));
    const base = lathe([[0, 0], [0.64, 0], [0.66, 0.05], [0.67, 0.1], [0.62, 0.15], [0.54, 0.17], [0.52, 0.21], [0.56, 0.25], [0.57, 0.28], [0.53, 0.32], [0.5, 0.34], [0, 0.34]]);
    group.add(mesh(base, marble.base, "base", [0, y + 0.12, 0]));
    y += 0.46;
  }
  const capH = order === "doric" ? 0.45 : order === "ionic" ? 0.42 : 1.15;
  const shaftH = ratio * 1 - capH - (order === "doric" ? 0 : 0.46);
  group.add(mesh(shaftGeometry(shaftH, rb, rt, order === "doric" ? 20 : 24, entasis, order !== "doric"), marble.shaft, "shaft", [0, y, 0]));
  y += shaftH;
  const cap = marble.capital;
  if (order === "doric") {
    group.add(mesh(lathe([[0, 0], [rt + 0.02, 0], [rt + 0.04, 0.04], [0.5, 0.12], [0.62, 0.22], [0.66, 0.27], [0, 0.27]]), cap, "capital", [0, y, 0]));
    group.add(mesh(new THREE.BoxGeometry(1.4, 0.18, 1.4), cap, "capital", [0, y + 0.36, 0]));
    y += 0.45;
  } else if (order === "ionic") {
    group.add(mesh(lathe([[0, 0], [rt + 0.03, 0], [0.5, 0.1], [0.5, 0.16], [0, 0.16]]), cap, "capital", [0, y, 0]));
    const yv = y + 0.12;
    for (const side of [-1, 1]) {
      const cushion = new THREE.CylinderGeometry(0.2, 0.2, 0.92, 32);
      cushion.rotateX(Math.PI / 2);
      group.add(mesh(cushion, cap, "capital", [side * 0.5, yv, 0]));
      for (const face of [-1, 1]) {
        group.add(mesh(spiral(side * 0.5, yv, face * 0.465, 0.19, side), dark, "capital"));
        group.add(mesh(new THREE.SphereGeometry(0.035, 12, 8), dark, "capital", [side * 0.5, yv, face * 0.465]));
      }
    }
    group.add(mesh(new THREE.BoxGeometry(1.0, 0.14, 0.92), cap, "capital", [0, yv + 0.1, 0]));
    group.add(mesh(new THREE.BoxGeometry(1.25, 0.07, 1.0), cap, "capital", [0, yv + 0.21, 0]));
    y += 0.42;
  } else {
    group.add(mesh(lathe([[0, 0], [rt + 0.02, 0], [0.44, 0.4], [0.5, 0.85], [0.56, 1.0], [0, 1.0]]), cap, "capital", [0, y, 0]));
    const leafMat = m.marble();
    leafMat.side = THREE.DoubleSide;
    for (let row = 0; row < 2; row++) for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (row ? Math.PI / 8 : 0);
      const leaf = mesh(leafGeometry(0.32, row ? 0.55 : 0.4, 0.22), leafMat, "capital");
      leaf.position.set(Math.cos(a) * (0.44 + row * 0.02), y + 0.02 + row * 0.22, Math.sin(a) * (0.44 + row * 0.02));
      leaf.lookAt(Math.cos(a) * 5, leaf.position.y, Math.sin(a) * 5);
      group.add(leaf);
    }
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const helix = new THREE.TorusGeometry(0.08, 0.025, 8, 24, Math.PI * 1.6);
      const h = mesh(helix, cap, "capital", [Math.cos(a) * 0.6, y + 0.86, Math.sin(a) * 0.6]);
      h.lookAt(Math.cos(a) * 5, y + 0.86, Math.sin(a) * 5);
      group.add(h);
    }
    group.add(mesh(concaveAbacus(0.66, 0.14, 0.15), cap, "capital", [0, y + 1.0, 0]));
    y += 1.15;
  }
  // entablature
  if (order === "doric") {
    group.add(mesh(new THREE.BoxGeometry(3.2, 0.55, 1.3), marble.architrave, "architrave", [0, y + 0.275, 0]));
    y += 0.55;
    group.add(mesh(new THREE.BoxGeometry(3.2, 0.62, 1.22), marble.frieze, "frieze", [0, y + 0.31, 0]));
    for (const x of [-1.42, -0.47, 0.47, 1.42]) {
      group.add(mesh(new THREE.BoxGeometry(0.36, 0.62, 0.08), marble.frieze, "frieze", [x, y + 0.31, 0.64]));
      for (const g of [-0.06, 0.06]) group.add(mesh(new THREE.BoxGeometry(0.035, 0.56, 0.02), dark, "frieze", [x + g, y + 0.31, 0.69]));
    }
    for (const x of [-0.95, 0, 0.95]) group.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 24).rotateX(Math.PI / 2), marble.frieze, "frieze", [x, y + 0.31, 0.63]));
    y += 0.62;
  } else {
    for (let i = 0; i < 3; i++) group.add(mesh(new THREE.BoxGeometry(3.2, 0.17, 1.2 + i * 0.04), marble.architrave, "architrave", [0, y + 0.085 + i * 0.17, 0]));
    y += 0.51;
    group.add(mesh(new THREE.BoxGeometry(3.2, 0.5, 1.2), marble.frieze, "frieze", [0, y + 0.25, 0]));
    const wave = new THREE.TorusGeometry(0.12, 0.025, 6, 16, Math.PI);
    for (let i = 0; i < 9; i++) group.add(mesh(wave, marble.frieze, "frieze", [-1.4 + i * 0.35, y + 0.2 + (i % 2) * 0.06, 0.61]));
    y += 0.5;
    for (let i = 0; i < 16; i++) group.add(mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), marble.cornice, "cornice", [-1.5 + i * 0.2, y + 0.05, 0.66]));
  }
  group.add(mesh(new THREE.BoxGeometry(3.6, 0.24, 1.6), marble.cornice, "cornice", [0, y + 0.22, 0]));
  return { group };
}

/* ---------------- temple ---------------- */

export function buildTemple(m: Mats, o: ModelOptions): Built {
  const kind = (o.kind as string) ?? "greek";
  const cut = Boolean(o.cutaway);
  const group = new THREE.Group();
  const stone = m.marble();
  const colMat = m.marble();
  const cellaMat = m.stone();
  const roofMat = m.roof();
  if (kind === "greek") {
    const W = 9.6, L = 19, H = 5.2;
    for (let i = 0; i < 3; i++) group.add(mesh(new THREE.BoxGeometry(W + 1.8 - i * 0.6, 0.3, L + 1.8 - i * 0.6), stone, "steps", [0, 0.15 + i * 0.3, 0]));
    const base = 0.9, nx = 6, nz = 13;
    for (let i = 0; i < nx; i++) for (const z of [-L / 2 + 0.6, L / 2 - 0.6]) { const c = simpleColumn(colMat, H, 0.42, "colonnade"); c.position.set(-W / 2 + 0.6 + (i * (W - 1.2)) / (nx - 1), base, z); group.add(c); }
    for (let j = 1; j < nz - 1; j++) for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) { const c = simpleColumn(colMat, H, 0.42, "colonnade"); c.position.set(x, base, -L / 2 + 0.6 + (j * (L - 1.2)) / (nz - 1)); group.add(c); }
    const cw = W - 3.6, cl = L - 6;
    for (const x of [-cw / 2, cw / 2]) group.add(mesh(new THREE.BoxGeometry(0.4, H, cl), cellaMat, "cella", [x, base + H / 2, -0.4]));
    group.add(mesh(new THREE.BoxGeometry(cw, H, 0.4), cellaMat, "cella", [0, base + H / 2, -0.4 - cl / 2]));
    for (const x of [-cw / 2 + 0.9, cw / 2 - 0.9]) group.add(mesh(new THREE.BoxGeometry(1.4, H, 0.4), cellaMat, "cella", [x, base + H / 2, -0.4 + cl / 2]));
    for (const x of [-1, 1]) { const c = simpleColumn(colMat, H, 0.32, "porch"); c.position.set(x * 1.2, base, cl / 2 + 0.6); group.add(c); }
    const st = statue(m); st.position.set(0, base, -cl / 2 + 1.6); group.add(st);
    if (!cut) {
      const ent = new THREE.Group();
      ent.add(mesh(new THREE.BoxGeometry(W, 1.2, L), stone, "roof", [0, base + H + 1.25, 0]));
      const g = gable(W + 0.4, 1.9, L + 0.4, roofMat, "roof"); g.position.y = base + H + 1.85; ent.add(g);
      for (const z of [L / 2 + 0.2, -L / 2 - 0.2]) {
        ent.add(mesh(new THREE.ConeGeometry(0.35, 0.8, 12), m.gold(), "roof", [0, base + H + 4.1, z]));
      }
      group.add(ent);
    }
  } else if (kind === "roman") {
    const W = 9, L = 17, P = 2.6, H = 6;
    group.add(mesh(new THREE.BoxGeometry(W, P, L), stone, "podium", [0, P / 2, -1]));
    for (let i = 0; i < 12; i++) group.add(mesh(new THREE.BoxGeometry(W - 2.4, P - (i * P) / 12, 0.42), stone, "steps", [0, (P - (i * P) / 12) / 2, L / 2 - 1 + 0.21 + i * 0.42]));
    for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) group.add(mesh(new THREE.BoxGeometry(1.2, P, 5), stone, "podium", [x, P / 2, L / 2 + 1.4]));
    for (let i = 0; i < 6; i++) { const c = simpleColumn(colMat, H, 0.4, "porch", true); c.position.set(-W / 2 + 0.7 + (i * (W - 1.4)) / 5, P, L / 2 - 1.7); group.add(c); }
    for (const z of [L / 2 - 4.2, L / 2 - 6.7]) for (const x of [-W / 2 + 0.7, W / 2 - 0.7]) { const c = simpleColumn(colMat, H, 0.4, "porch", true); c.position.set(x, P, z); group.add(c); }
    const cl = L - 8;
    const cz = -1 - L / 2 + cl / 2 + 0.2;
    for (const x of [-W / 2 + 0.5, W / 2 - 0.5]) group.add(mesh(new THREE.BoxGeometry(0.5, H + 0.6, cl), cellaMat, "cella", [x, P + (H + 0.6) / 2, cz]));
    group.add(mesh(new THREE.BoxGeometry(W - 1, H + 0.6, 0.5), cellaMat, "cella", [0, P + (H + 0.6) / 2, cz - cl / 2]));
    for (const x of [-2.5, 2.5]) group.add(mesh(new THREE.BoxGeometry(2.6, H + 0.6, 0.5), cellaMat, "cella", [x, P + (H + 0.6) / 2, cz + cl / 2]));
    const st = statue(m); st.position.set(0, P, cz - cl / 2 + 1.5); group.add(st);
    if (!cut) {
      group.add(mesh(new THREE.BoxGeometry(W, 1.1, L - 1.4), stone, "roof", [0, P + H + 1.2, -0.3]));
      const g = gable(W + 0.4, 2.2, L - 1, roofMat, "roof"); g.position.set(0, P + H + 1.75, -0.3); group.add(g);
    }
  } else {
    const R = 5;
    for (let i = 0; i < 3; i++) group.add(mesh(new THREE.CylinderGeometry(R + 1 - i * 0.35, R + 1 - i * 0.35, 0.3, 64), stone, "steps", [0, 0.15 + i * 0.3, 0]));
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; const c = simpleColumn(colMat, 5, 0.32, "colonnade", true); c.position.set(Math.cos(a) * R, 0.9, Math.sin(a) * R); group.add(c); }
    const wall = new THREE.CylinderGeometry(3.3, 3.3, 5.6, 48, 1, true, 0.3, Math.PI * 2 - 0.6);
    const cellaWallMat = m.stone(); cellaWallMat.side = THREE.DoubleSide;
    group.add(mesh(wall, cellaWallMat, "cella", [0, 0.9 + 2.8, 0]));
    const st = statue(m); st.position.set(0, 0.9, 0); group.add(st);
    if (!cut) {
      group.add(mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.55, 0.8, 64), stone, "roof", [0, 6.7, 0]));
      group.add(mesh(new THREE.ConeGeometry(R + 0.8, 2.4, 64), roofMat, "roof", [0, 8.3, 0]));
    }
  }
  return { group };
}

/* ---------------- pantheon ---------------- */

export function buildPantheon(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const R = 7, H = 7;
  const cut = Boolean(o.cutaway);
  const hour = Number(o.hour ?? 12);
  const clip = cut ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.01)] : [];
  const wallMat = m.stone(); wallMat.side = THREE.DoubleSide; wallMat.clippingPlanes = clip;
  const domeMat = m.coffers(); domeMat.clippingPlanes = clip;
  const floorMat = m.marble();
  group.add(mesh(new THREE.CylinderGeometry(R + 0.2, R + 0.2, 0.2, 64), floorMat, "rotunda", [0, 0.1, 0]));
  group.add(mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true), wallMat, "rotunda", [0, H / 2 + 0.2, 0]));
  const oculus = 0.15;
  group.add(mesh(new THREE.SphereGeometry(R, 64, 32, 0, Math.PI * 2, oculus, Math.PI / 2 - oculus), domeMat, "dome", [0, H + 0.2, 0]));
  const ringR = R * Math.sin(oculus);
  const ring = mesh(new THREE.TorusGeometry(ringR, 0.12, 12, 48), m.gold(), "oculus", [0, H + 0.2 + R * Math.cos(oculus), 0]);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  // portico
  const colMat = m.marble();
  for (let i = 0; i < 8; i++) { const c = simpleColumn(colMat, 5.6, 0.36, "portico", true); c.position.set(-4.9 + i * 1.4, 0.2, R + 3.4); group.add(c); }
  group.add(mesh(new THREE.BoxGeometry(11, 1, 4.2), m.stone(), "portico", [0, 6.9, R + 1.9]));
  const ped = gable(11.2, 2.2, 4.2, m.stone(), "portico"); ped.position.set(0, 7.4, R + 1.9); group.add(ped);
  // the sun through the oculus
  const elev = THREE.MathUtils.degToRad(25 + 50 * Math.sin((Math.PI * (hour - 6)) / 12));
  const az = THREE.MathUtils.degToRad((hour - 12) * 15);
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(elev), -Math.sin(elev), -Math.cos(az) * Math.cos(elev)).normalize();
  const top = new THREE.Vector3(0, H + 0.2 + R * Math.cos(oculus), 0);
  const tHit = -top.y / dir.y;
  const hit = top.clone().addScaledVector(dir, tHit * 0.999);
  const len = top.distanceTo(hit);
  const beamGeo = new THREE.CylinderGeometry(ringR * 0.95, ringR * 1.05, len, 32, 1, true);
  const beam = mesh(beamGeo, m.beam(), "beam");
  beam.castShadow = false; beam.receiveShadow = false;
  beam.position.copy(top.clone().add(hit).multiplyScalar(0.5));
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate());
  group.add(beam);
  const spot = mesh(new THREE.CircleGeometry(ringR * 1.15, 32), new THREE.MeshBasicMaterial({ color: "#fff3c4", transparent: true, opacity: 0.85 }), "beam");
  spot.rotation.x = -Math.PI / 2;
  // a low sun stretches the spot; it may also climb the wall — keep it inside the rotunda
  const flat = new THREE.Vector2(hit.x, hit.z);
  if (flat.length() > R - ringR) flat.setLength(R - ringR);
  spot.position.set(flat.x, 0.22, flat.y);
  spot.scale.set(1, 1 / Math.max(0.35, Math.sin(elev)), 1);
  spot.rotation.z = -az;
  group.add(spot);
  return { group, tick: (t) => { (beam.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.05 * Math.sin(t * 1.5); } };
}

/* ---------------- aqueduct ---------------- */

function arcade(n: number, span: number, pier: number, h: number, depth: number, mat: THREE.Material) {
  const total = n * (span + pier) + pier;
  const s = new THREE.Shape();
  s.moveTo(-total / 2, 0); s.lineTo(total / 2, 0); s.lineTo(total / 2, h); s.lineTo(-total / 2, h); s.lineTo(-total / 2, 0);
  const spring = h - span / 2 - 0.9;
  for (let i = 0; i < n; i++) {
    const x0 = -total / 2 + pier + i * (span + pier);
    const hole = new THREE.Path();
    hole.moveTo(x0, 0); hole.lineTo(x0 + span, 0); hole.lineTo(x0 + span, spring);
    hole.absarc(x0 + span / 2, spring, span / 2, 0, Math.PI, false);
    hole.lineTo(x0, 0);
    s.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, mat, "arches");
}

export function buildAqueduct(m: Mats, o: ModelOptions): Built {
  const group = new THREE.Group();
  const doubled = Boolean(o.doubled);
  const n = 9, span = 2.8, pier = 1, h = 6, depth = 1.6;
  const total = n * (span + pier) + pier;
  const ground = mesh(new THREE.PlaneGeometry(total + 14, 22), m.sand(), "ground");
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  group.add(ground);
  const waters: THREE.Texture[] = [];
  const line = (z: number, part: string, later: boolean) => {
    const mat = m.stone();
    if (later) mat.color = new THREE.Color("#efe0c4");
    const a = arcade(n, span, pier, h, depth, mat);
    a.userData.part = part;
    a.position.z = z;
    group.add(a);
    for (const side of [-1, 1]) group.add(mesh(new THREE.BoxGeometry(total, 0.6, 0.25), mat, "channel", [0, h + 0.3, z + side * (depth / 2 - 0.125)]));
    group.add(mesh(new THREE.BoxGeometry(total, 0.1, depth), mat, "channel", [0, h + 0.05, z]));
    const water = m.water();
    waters.push(water.map!);
    const w = mesh(new THREE.PlaneGeometry(total, depth - 0.5), water, "water", [0, h + 0.4, z]);
    w.rotation.x = -Math.PI / 2;
    w.castShadow = false;
    group.add(w);
  };
  line(0, "arches", false);
  if (doubled) line(-depth, "hadrian", true);
  const plaque = mesh(new THREE.BoxGeometry(0.9, 0.55, 0.06), m.marble(), "inscription", [-total / 2 + pier + 2 * (span + pier) - pier / 2, h - 1.2, (doubled ? -depth : 0) - depth / 2 - 0.03]);
  group.add(plaque);
  return { group, tick: (t) => { for (const tex of waters) tex.offset.x = -(t * 0.35) % 1; } };
}

