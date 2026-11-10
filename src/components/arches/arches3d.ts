/*
 * קשתות וקמרונות בתלת־ממד (LA-90). מחולל אחד לכל הסוגים: עקומת הקשת (מדורגת, עגולה,
 * מחודדת, פרסה) נחתכת לאבני קשת, וכל אבן היא טריז שבולט לעומק. קמרון חבית הוא אותה
 * קשת שנמתחת לאורך, וקמרון צולב הוא שתי חביות שחוצות זו את זו. נטען ב-dynamic import.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ArchType, Profile } from "@/data/arches/arches";
import { intrados, SPAN } from "./profile";

const PIER = 2.4;        // גובה העמודים עד קו הזינוק
const RING = 0.55;       // עובי טבעת האבנים
const WALL = 0.9;        // עובי קיר בקשת בודדת
const LONG = 7;          // אורך קמרון החבית

type Pt = [number, number];

/** הנורמל החיצוני בכל נקודה (מאונך למשיק, הרחק מתוך הפתח). */
function outward(pts: Pt[]): Pt[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    if (nx * p[0] + ny * (p[1] + 0.5) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  });
}

const COLORS = {
  stone: 0xd9cdb3, stone2: 0xc9bb9c, key: 0xe9d8a8, mudbrick: 0x9a6a48, mud2: 0x86593b,
  basalt: 0x4a4744, ablaqDark: 0x5a4a3f, ablaqLight: 0xe6dcc6, wall: 0xcfc3a8, mudwall: 0xa57a58, ground: 0xb9b19e,
};

export type ArchViewer = {
  show(type: ArchType, opts: { forces: boolean }): void;
  build(): void;
  resetView(): void;
  setTheme(theme: "light" | "dark"): void;
  dispose(): void;
};

export function createArchViewer(host: HTMLElement, theme: "light" | "dark"): ArchViewer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = 1.5;
  controls.minDistance = 4;
  controls.maxDistance = 40;
  controls.target.set(0, 1, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7f6a, 1.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(6, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
  scene.add(sun);

  const groundMat = new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 48), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -PIER;
  ground.receiveShadow = true;
  scene.add(ground);

  let model = new THREE.Group();
  scene.add(model);
  let blocks: THREE.Object3D[] = [];
  let anim = 0;

  const mat = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
  const add = (g: THREE.Group, mesh: THREE.Mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };

  /** טבעת אבני קשת לאורך העקומה. מחזירה את האבנים לפי סדר הבנייה (מהצדדים פנימה). */
  function ring(g: THREE.Group, pts: Pt[], stones: number, depth: number, z: number, pick: (i: number, n: number) => number, inner = 0, thick = RING) {
    const nrm = outward(pts);
    const made: THREE.Mesh[] = [];
    const step = (pts.length - 1) / stones;
    for (let s = 0; s < stones; s++) {
      const shape = new THREE.Shape();
      const corners: Pt[] = [];
      const i0 = Math.round(s * step), i1 = Math.round((s + 1) * step);
      for (let i = i0; i <= i1; i++) corners.push([pts[i][0] + nrm[i][0] * inner, pts[i][1] + nrm[i][1] * inner]);
      for (let i = i1; i >= i0; i--) corners.push([pts[i][0] + nrm[i][0] * (inner + thick), pts[i][1] + nrm[i][1] * (inner + thick)]);
      shape.moveTo(...corners[0]);
      corners.slice(1).forEach((c) => shape.lineTo(...c));
      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
      geo.translate(0, 0, z - depth / 2);
      // a hair of mortar between the stones
      geo.scale(0.995, 0.995, 1);
      const m = add(g, new THREE.Mesh(geo, mat(pick(s, stones))));
      m.userData.order = Math.abs(s - (stones - 1) / 2);
      made.push(m);
    }
    return made;
  }

  function pier(g: THREE.Group, x: number, z: number, w: number, d: number, color: number) {
    const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(w, PIER, d), mat(color)));
    m.position.set(x, -PIER / 2, z);
    return m;
  }

  /** קיר החזית סביב קשת בודדת: מלבן עם פתח בצורת הקשת. */
  function facade(g: THREE.Group, pts: Pt[], color: number, top = 4.2) {
    const shape = new THREE.Shape();
    shape.moveTo(-SPAN, -PIER); shape.lineTo(SPAN, -PIER); shape.lineTo(SPAN, top); shape.lineTo(-SPAN, top); shape.lineTo(-SPAN, -PIER);
    const hole = new THREE.Path();
    hole.moveTo(pts[0][0], -PIER);
    pts.forEach((p) => hole.lineTo(p[0], p[1]));
    hole.lineTo(pts[pts.length - 1][0], -PIER);
    hole.lineTo(pts[0][0], -PIER);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: WALL, bevelEnabled: false });
    geo.translate(0, 0, -WALL / 2);
    return add(g, new THREE.Mesh(geo, mat(color)));
  }

  /** קשת מדורגת: נדבכים שבולטים פנימה עד שהם נפגשים. */
  function corbel(g: THREE.Group) {
    const courses = 6, h = 0.42, step = (SPAN / 2) / courses;
    const made: THREE.Mesh[] = [];
    for (let c = 0; c < courses; c++) {
      for (const side of [-1, 1]) {
        const inner = SPAN / 2 - step * (c + 1);
        const w = SPAN - inner;
        const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.97, WALL), mat(c % 2 ? COLORS.stone2 : COLORS.stone)));
        m.position.set(side * (inner + w / 2), c * h + h / 2, 0);
        made.push(m);
      }
    }
    const cap = add(g, new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2, 1.2, WALL), mat(COLORS.wall)));
    cap.position.set(0, courses * h + 0.6, 0);
    made.push(cap);
    for (const side of [-1, 1]) pier(g, side * (SPAN / 2 + SPAN / 4), 0, SPAN / 2, WALL, COLORS.wall);
    return made;
  }

  /** מוקרנס מסוגנן: שורות של תאים קטנים, שקטנות כלפי מעלה, בגומחה שמעל הקשת. */
  function muqarnas(g: THREE.Group, top: number) {
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const cells = 7 - r * 2 + 1;
      for (let i = 0; i < cells; i++) {
        const w = 0.42, x = (i - (cells - 1) / 2) * w;
        const geo = new THREE.ConeGeometry(w * 0.55, 0.42, 4, 1, true);
        const m = add(g, new THREE.Mesh(geo, mat(r % 2 ? COLORS.ablaqLight : COLORS.stone2)));
        m.rotation.x = Math.PI;
        m.position.set(x, top + 0.3 + r * 0.36, WALL / 2 + 0.2 - r * 0.06);
      }
    }
  }

  function forceArrows(g: THREE.Group, profile: Profile) {
    const color = 0xd94a3a;
    const slope = profile === "pointed" ? [0.38, -1] : profile === "corbel" ? [0, -1] : [0.85, -1];
    for (const side of [-1, 1]) {
      const dir = new THREE.Vector3(side * slope[0], slope[1], 0).normalize();
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(side * (SPAN / 2 + RING / 2), 0.25, WALL / 2 + 0.3), 1.8, color, 0.45, 0.3);
      g.add(arrow);
    }
    const down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 4.4, WALL / 2 + 0.3), 1.2, color, 0.4, 0.28);
    g.add(down);
  }

  function show(type: ArchType, opts: { forces: boolean }) {
    cancelAnimationFrame(anim);
    scene.remove(model);
    model.traverse((o) => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); } });
    model = new THREE.Group();
    scene.add(model);
    const g = model;
    const { form, material, ablaq, rings = 1 } = type.model;
    const pts = intrados(type.profile);
    const base = material === "mudbrick" ? COLORS.mudbrick : material === "basalt" ? COLORS.basalt : COLORS.stone;
    const alt = material === "mudbrick" ? COLORS.mud2 : COLORS.stone2;
    const wallColor = material === "mudbrick" ? COLORS.mudwall : COLORS.wall;

    if (type.profile === "corbel") {
      blocks = corbel(g);
    } else {
      const stonesPer = material === "mudbrick" ? 27 : type.profile === "pointed" ? 14 : 13;
      const pick = (i: number, n: number) => ablaq ? (i % 2 ? COLORS.ablaqDark : COLORS.ablaqLight)
        : material !== "mudbrick" && type.profile !== "pointed" && i === (n - 1) / 2 ? COLORS.key
        : i % 2 ? alt : base;
      const ringsMade: THREE.Mesh[] = [];
      const thick = material === "mudbrick" ? 0.24 : RING;
      if (form === "arch") {
        const apex = Math.max(...pts.map((p) => p[1])) + RING;
        facade(g, pts, wallColor, type.model.muqarnas ? apex + 2 : Math.max(4.2, apex + 0.8));
        for (let r = 0; r < rings; r++) ringsMade.push(...ring(g, pts, stonesPer, WALL + 0.12, 0, pick, r * thick, thick));
        if (type.model.muqarnas) muqarnas(g, apex);
      } else {
        const lengths = form === "cross" ? [0, Math.PI / 2] : [0];
        for (const rot of lengths) {
          const sub = new THREE.Group();
          for (let r = 0; r < rings; r++) ringsMade.push(...ring(sub, pts, stonesPer, LONG, 0, pick, r * thick, thick));
          sub.rotation.y = rot;
          g.add(sub);
        }
        if (form === "barrel") {
          for (const side of [-1, 1]) pier(g, side * (SPAN / 2 + 0.35), 0, 0.7, LONG, wallColor);
        } else {
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) pier(g, sx * (SPAN / 2 + 0.35), sz * (SPAN / 2 + 0.35), 0.7, 0.7, wallColor);
        }
      }
      // building order: from both springings inwards, the keystone last
      blocks = [...ringsMade].sort((a, b) => b.userData.order - a.userData.order);
    }
    if (opts.forces) forceArrows(g, type.profile);
    render();
  }

  /** "בנו את הקשת": האבנים נכנסות אחת אחת מהצדדים, ואבן הראשה אחרונה. */
  function build() {
    cancelAnimationFrame(anim);
    blocks.forEach((b) => { b.visible = false; });
    render();
    const start = performance.now(), per = Math.max(40, 2600 / Math.max(1, blocks.length));
    const tick = (now: number) => {
      const shown = Math.min(blocks.length, Math.floor((now - start) / per) + 1);
      blocks.forEach((b, i) => { b.visible = i < shown; });
      render();
      if (shown < blocks.length) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }

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
    const far = camera.aspect < 0.9 ? 1.5 : 1;
    camera.position.set(5.5 * far, 3.2 * far, 10 * far);
    controls.target.set(0, 0.6, 0);
    controls.update();
    render();
  };
  const setTheme = (t: "light" | "dark") => {
    groundMat.color.set(t === "dark" ? 0x2b3a44 : COLORS.ground);
    hemi.intensity = t === "dark" ? 1.1 : 1.4;
    render();
  };

  resize();
  resetView();
  setTheme(theme);

  return {
    show, build, resetView, setTheme,
    dispose() {
      cancelAnimationFrame(anim);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
