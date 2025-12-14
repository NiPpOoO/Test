import * as THREE from "three";
import arnft from "arnft";
const { ARnft } = arnft;
import ARnftThreejs from "arnft-threejs";
const { SceneRendererTJS, NFTaddTJS } = ARnftThreejs;

const statusEl = document.getElementById("status");
const videoEl = document.getElementById("video");

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "environment", width: { min: 480, max: 640 } }
  });
  videoEl.srcObject = stream;
  await new Promise(res => (videoEl.onloadedmetadata = () => res()));
  await videoEl.play().catch(() => {});
}

async function initAR() {
  setStatus("Инициализация…");

  const markerPaths = [["./assets/markers/snowman"]];
  const markerNames = [["snowman"]];

  const nft = await ARnft.init(
    640, 480,
    markerPaths,
    markerNames,
    "./src/config.json",
    true
  );

  document.addEventListener("containerEvent", () => {
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

    const tick = () => { sceneThreejs.draw(); requestAnimationFrame(tick); };
    tick();

    setStatus("Наведи камеру на снеговика.");
  });

  document.addEventListener(`getMatrixGL_RH-${nft.uuid}-snowman`, () => {
    setStatus("Снеговик найден ✔");
  });

  document.addEventListener(`nftTrackingLost-${nft.uuid}-snowman`, () => {
    setStatus("Трекинг потерян, наведи камеру снова…");
  });
}

(async () => {
  try {
    await startCamera();
    await initAR();
    setStatus("Камера запущена, AR готов.");
  } catch (err) {
    console.error("Ошибка запуска:", err);
    setStatus("Ошибка запуска. Проверь HTTPS и пути к файлам.");
  }
})();
