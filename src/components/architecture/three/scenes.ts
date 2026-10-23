/**
 * Procedural 3D models of the course's buildings, built from three.js
 * primitives — no model files to download. Loaded with a dynamic import, so
 * three.js only reaches the browser when a 3D tab is opened.
 *
 * Every mesh carries `userData.part`; the viewer raycasts the pointer to
 * report and highlight the part, and the React side explains it.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { materials, type Built, type ModelOptions } from "./kit";
import { buildAqueduct, buildColumn, buildPantheon, buildTemple } from "./models1";
import { BUILDERS2, type ModelId2 } from "./models2";
import { BUILDERS3, type ModelId3 } from "./models3";

export type { ModelOptions };
export type ModelId = "column" | "temple" | "pantheon" | "aqueduct" | ModelId2 | ModelId3;

/* ---------------- viewer ---------------- */

export type Viewer = {
  setModel: (id: ModelId, options: ModelOptions) => void;
  highlight: (part: string | null) => void;
  setAutoRotate: (on: boolean) => void;
  resetView: () => void;
  dispose: () => void;
};

export function createViewer(host: HTMLElement, events: { onHover: (part: string | null, x: number, y: number) => void; onPick: (part: string) => void }): Viewer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  renderer.domElement.style.touchAction = "none";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
  scene.add(new THREE.HemisphereLight("#fff8ea", "#6b5a44", 1.4));
  const sun = new THREE.DirectionalLight("#fff1d6", 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#bcd6ff", 0.6);
  fill.position.set(-20, 10, -10);
  scene.add(fill);
  const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.22 }));
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.autoRotateSpeed = 0.8;

  const mats = materials();
  let current: Built | null = null;
  let hovered: string | null = null;
  let selected: string | null = null;
  let home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  let lastKey = "";

  const paint = () => {
    current?.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (!mat || !("emissive" in mat)) return;
      const part = mesh.userData.part;
      const on = part && (part === hovered || part === selected);
      mat.emissive.set(on ? (part === hovered ? "#ff9a3c" : "#ffb85c") : "#000000");
      mat.emissiveIntensity = on ? 0.32 : 0;
    });
  };

  const disposeGroup = (group: THREE.Group) => group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose(); }
  });

  const fit = (group: THREE.Group, keepView: boolean, view?: [number, number, number]) => {
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const radius = size.length() / 2;
    shadowFloor.position.y = box.min.y - 0.01;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.02;
    sun.position.set(center.x + radius * 1.2, center.y + radius * 2.2, center.z + radius * 1.4);
    sun.target.position.copy(center);
    scene.add(sun.target);
    const cam = sun.shadow.camera;
    cam.left = cam.bottom = -radius * 1.4; cam.right = cam.top = radius * 1.4; cam.near = 0.1; cam.far = radius * 6;
    cam.updateProjectionMatrix();
    controls.minDistance = radius * 0.6;
    controls.maxDistance = radius * 4;
    home = { pos: center.clone().add(new THREE.Vector3(...(view ?? [0.75, 0.42, 1])).normalize().multiplyScalar(dist)), target: center };
    if (!keepView) { camera.position.copy(home.pos); controls.target.copy(home.target); }
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const partAt = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = current ? raycaster.intersectObject(current.group, true).find((h) => h.object.userData.part && h.object.userData.part !== "ground") : undefined;
    return { part: (hit?.object.userData.part as string | undefined) ?? null, x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  let down = { x: 0, y: 0 };
  const onMove = (event: PointerEvent) => {
    if (event.buttons) return;
    const { part, x, y } = partAt(event);
    if (part !== hovered) { hovered = part; paint(); }
    renderer.domElement.style.cursor = part ? "pointer" : "grab";
    events.onHover(part, x, y);
  };
  const onDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; controls.autoRotate = false; };
  const onUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
    const { part } = partAt(event);
    if (part) { selected = part; paint(); events.onPick(part); }
  };
  const onLeave = () => { hovered = null; paint(); events.onHover(null, 0, 0); };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointerleave", onLeave);

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    current?.tick?.(t);
    controls.update();
    renderer.render(scene, camera);
  });

  return {
    setModel(id, options) {
      const key = id;
      const keepView = key === lastKey;
      lastKey = key;
      if (current) { scene.remove(current.group); disposeGroup(current.group); }
      current = id === "column" ? buildColumn(mats, options) : id === "temple" ? buildTemple(mats, options) : id === "pantheon" ? buildPantheon(mats, options) : id === "aqueduct" ? buildAqueduct(mats, options) : id in BUILDERS3 ? BUILDERS3[id as ModelId3](mats, options) : BUILDERS2[id as ModelId2](mats, options);
      scene.add(current.group);
      fit(current.group, keepView, current.view);
      paint();
    },
    highlight(part) { selected = part; paint(); },
    setAutoRotate(on) { controls.autoRotate = on; },
    resetView() { camera.position.copy(home.pos); controls.target.copy(home.target); },
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      if (current) disposeGroup(current.group);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
