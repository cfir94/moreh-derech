/*
 * The 3D relief of the geology aid. Loaded with a dynamic import only when the
 * map tab opens, so three.js never weighs on the rest of the page.
 *
 * The relief is a grid of elevations (public/geology/relief.bin, built by
 * tools/build_geology_relief.py from the route map's terrain tiles). The
 * geology is painted onto a canvas texture from the same GeoJSON the route map
 * uses, in the same Web Mercator frame, and a second, hidden canvas holds one
 * flat colour per unit so a tap can be turned into a unit id exactly.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RELIEF } from "@/data/geology/relief";

export type Unit = {
  id: string;
  name: string;
  color: string;
  age: string;
  rings: [number, number][][][]; // polygons → rings → [lon, lat]
};

export type ReliefAssets = { elevation: Int16Array; water: Record<"light" | "dark", HTMLImageElement> };

export type Focus = { unit?: string | null; age?: string | null };

export type ReliefViewer = {
  setUnits(units: Unit[]): void;
  setFocus(focus: Focus): void;
  setExaggeration(value: number): void;
  setTheme(theme: "light" | "dark"): void;
  resetView(): void;
  dispose(): void;
};

const WIDTH = 10; // scene units across the map
const DEPTH = (WIDTH * RELIEF.frame.h) / RELIEF.frame.w;
const LAT_MID = (RELIEF.bounds[1] + RELIEF.bounds[3]) / 2;
// scene units per metre of elevation, before exaggeration
const PER_METRE = (WIDTH / RELIEF.frame.w) * RELIEF.frame.scale / (40075016 * Math.cos((LAT_MID * Math.PI) / 180));
const LAND = { light: "#ece5d3", dark: "#24323b" } as const;
const PICK_W = 512;

/** Unit i as an exact colour on the pick canvas: steps of 9 in red and green, up to 783 units. */
function pickCode(i: number): [number, number] {
  const n = i + 1;
  return [(n % 28) * 9, Math.floor(n / 28) * 9];
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });
}

export async function loadReliefAssets(base: (path: string) => string): Promise<ReliefAssets> {
  const [buffer, light, dark] = await Promise.all([
    fetch(base("/geology/relief.bin")).then((r) => { if (!r.ok) throw new Error("relief"); return r.arrayBuffer(); }),
    loadImage(base("/geology/water-light.png")),
    loadImage(base("/geology/water-dark.png")),
  ]);
  return { elevation: new Int16Array(buffer), water: { light, dark } };
}

/** lon/lat → texture pixel, in the frame tools/build_geology_relief.py used. */
function project(lon: number, lat: number, pxPerUnit: number): [number, number] {
  const x = (lon + 180) / 360;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  return [(x - RELIEF.frame.x0) * RELIEF.frame.scale * pxPerUnit, (y - RELIEF.frame.y0) * RELIEF.frame.scale * pxPerUnit];
}

function tracePolygons(ctx: CanvasRenderingContext2D, unit: Unit, pxPerUnit: number) {
  ctx.beginPath();
  for (const polygon of unit.rings) {
    for (const ring of polygon) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat, pxPerUnit);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
  }
}

export function createReliefViewer(host: HTMLElement, assets: ReliefAssets, events: {
  onPick: (id: string | null) => void;
  onHover: (id: string | null, x: number, y: number) => void;
}, theme: "light" | "dark"): ReliefViewer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = 1.32;
  controls.minDistance = 1.2;
  controls.maxDistance = 60;
  controls.screenSpacePanning = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6250, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-6, 9, -5); // from the north-west, the cartographer's light
  scene.add(sun);

  // ------------------------------------------------------------ the relief
  const { w: gw, h: gh } = RELIEF.grid;
  const geometry = new THREE.PlaneGeometry(WIDTH, DEPTH, gw - 1, gh - 1);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  let exaggeration = 5;
  const applyHeights = () => {
    for (let i = 0; i < position.count; i++) {
      position.setY(i, Math.max(assets.elevation[i] ?? 0, -450) * PER_METRE * exaggeration);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  };
  applyHeights();

  const tw = RELIEF.water.w, th = RELIEF.water.h;
  const canvas = document.createElement("canvas");
  canvas.width = tw; canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const pick = document.createElement("canvas");
  pick.width = PICK_W; pick.height = Math.round((PICK_W * th) / tw);
  const pickCtx = pick.getContext("2d", { willReadFrequently: true })!;

  let units: Unit[] = [];
  let focus: Focus = {};
  let currentTheme = theme;

  const paint = () => {
    const ppu = tw / RELIEF.frame.w;
    ctx.globalAlpha = 1;
    ctx.fillStyle = LAND[currentTheme];
    ctx.fillRect(0, 0, tw, th);
    const dimmed = (u: Unit) => (focus.unit && u.id !== focus.unit) || (focus.age && u.age !== focus.age);
    for (const unit of units) {
      tracePolygons(ctx, unit, ppu);
      ctx.globalAlpha = dimmed(unit) ? 0.22 : 1;
      ctx.fillStyle = unit.color;
      ctx.fill("evenodd");
    }
    ctx.globalAlpha = 1;
    ctx.lineJoin = "round";
    for (const unit of units) {
      tracePolygons(ctx, unit, ppu);
      ctx.strokeStyle = currentTheme === "dark" ? "rgba(255,255,255,.35)" : "rgba(40,30,20,.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    const chosen = units.find((u) => u.id === focus.unit);
    if (chosen) {
      tracePolygons(ctx, chosen, ppu);
      ctx.strokeStyle = currentTheme === "dark" ? "#ffffff" : "#1b1b1b";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.drawImage(assets.water[currentTheme], 0, 0, tw, th);
    texture.needsUpdate = true;

    // the hidden pick map: one exact colour per unit, no smoothing at the edges
    const pp = pick.width / RELIEF.frame.w;
    pickCtx.imageSmoothingEnabled = false;
    pickCtx.fillStyle = "#000";
    pickCtx.fillRect(0, 0, pick.width, pick.height);
    units.forEach((unit, i) => {
      tracePolygons(pickCtx, unit, pp);
      const [r, g] = pickCode(i);
      pickCtx.fillStyle = `rgb(${r},${g},0)`;
      pickCtx.fill("evenodd");
    });
    pickCtx.globalCompositeOperation = "destination-out";
    pickCtx.drawImage(assets.water.light, 0, 0, pick.width, pick.height);
    pickCtx.globalCompositeOperation = "source-over";
    render();
  };

  const unitAt = (clientX: number, clientY: number): string | null => {
    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(mesh)[0];
    if (!hit?.uv) return null;
    const px = Math.floor(hit.uv.x * pick.width), py = Math.floor((1 - hit.uv.y) * pick.height);
    const [r, g, , a] = pickCtx.getImageData(px, py, 1, 1).data;
    if (a < 255 || r % 9 || g % 9) return null; // anti-aliased edges blend two codes
    const index = (g / 9) * 28 + r / 9 - 1;
    return index >= 0 ? units[index]?.id ?? null : null;
  };

  // a tap is a press that did not turn into a drag
  let down: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: PointerEvent) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) events.onPick(unitAt(e.clientX, e.clientY));
    down = null;
  };
  let hoverFrame = 0;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.buttons) return;
    cancelAnimationFrame(hoverFrame);
    hoverFrame = requestAnimationFrame(() => {
      const rect = renderer.domElement.getBoundingClientRect();
      events.onHover(unitAt(e.clientX, e.clientY), e.clientX - rect.left, e.clientY - rect.top);
    });
  };
  const onLeave = () => events.onHover(null, 0, 0);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);

  function render() { renderer.render(scene, camera); }
  controls.addEventListener("change", render);

  const resize = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);

  const resetView = () => {
    // from the south-west, tilted, the whole country in view
    // the country is 2.6 times taller than it is wide, so a narrow screen
    // needs the camera much further back to keep Eilat and the Hermon in view
    const back = camera.aspect < 0.9 ? 1.45 : 1;
    controls.target.set(0.3, 0, 1.2);
    camera.position.set(-3 * back, 27 * back, 23 * back);
    controls.update();
    render();
  };

  resize();
  resetView();
  paint();

  return {
    setUnits(next) { units = next; paint(); },
    setFocus(next) { focus = next; paint(); },
    setExaggeration(value) { exaggeration = value; applyHeights(); render(); },
    setTheme(next) { if (next !== currentTheme) { currentTheme = next; paint(); } },
    resetView,
    dispose() {
      observer.disconnect();
      cancelAnimationFrame(hoverFrame);
      controls.dispose();
      geometry.dispose(); material.dispose(); texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
