import * as THREE from "three";
import arnft from "arnft";
const { ARnft } = arnft;
import ARnftThreejs from "arnft-threejs";
const { SceneRendererTJS, NFTaddTJS } = ARnftThreejs;

const statusEl = document.getElementById("status");
const videoEl = document.getElementById("video");

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
  console.log("[STATUS]", msg);
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "environment", width: { min: 480, max: 640 } }
    });
    videoEl.srcObject = stream;
    await new Promise(res => (videoEl.onloadedmetadata = () => res()));
    await videoEl.play().catch(() => {});
    console.log("[CAMERA] Камера запущена");
  } catch (err) {
    console.error("[CAMERA ERROR]", err);
    setStatus("Ошибка запуска камеры");
  }
}

async function initAR() {
  setStatus("Инициализация…");
  console.log("[ARnft] init() start...");

  try {
    const markerPaths = [["./assets/markers/snowman/"]]; // путь к папке
    const markerNames = [["snowman"]];                   // имя маркера

    console.log("[ARnft] markerPaths:", markerPaths);
    console.log("[ARnft] markerNames:", markerNames);

    const nft = await ARnft.init(
      640, 480,
      markerPaths,
      markerNames,
      "./config.json",   // config.json рядом с index.html
      true
    );

    console.log("[ARnft] init() success:", nft);

    document.addEventListener("containerEvent", () => {
      console.log("[ARnft] containerEvent получен");

      const canvas = document.getElementById("canvas");
      const sceneThreejs = new SceneRendererTJS(
        {
          camera: { fov: 60, ratio: window.innerWidth / window.innerHeight, near: 0.01, far: 2000 },
          renderer: { alpha: true, antialias: true }
        },
        canvas, nft.uuid, true
      );
      sceneThreejs.initRenderer();

      const scene = sceneThreejs.getScene();
      const light = new THREE.DirectionalLight("#fff", 0.9);
      light.position.set(0.5, 0.3, 0.866);
      scene.add(light);

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({ color: "#00ccff" })
      );
      cube.scale.set(80,80,80);

      const nftAddTJS = new NFTaddTJS(nft.uuid);
      nftAddTJS.add(cube, "snowman", false);
      console.log("[ARnft] Куб добавлен к маркеру");

      const tick = () => { sceneThreejs.draw(); requestAnimationFrame(tick); };
      tick();

      setStatus("Наведи камеру на снеговика.");
    });

    document.addEventListener(`getMatrixGL_RH-${nft.uuid}-snowman`, () => {
      console.log("[ARnft] Маркер найден");
      setStatus("Снеговик найден ✔");
    });

    document.addEventListener(`nftTrackingLost-${nft.uuid}-snowman`, () => {
      console.log("[ARnft] Трекинг потерян");
      setStatus("Трекинг потерян, наведи камеру снова…");
    });

  } catch (err) {
    console.error("[ARnft ERROR]", err);
    setStatus("Ошибка ARnft.init. Проверь пути к config.json и маркеру.");
  }
}

(async () => {
  await startCamera();
  await initAR();
})();
