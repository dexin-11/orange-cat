// 橘猫拍立得
// 图片来源：https://img.hdx.dpdns.org/random?dir=backimg

const API_URL = "https://img.hdx.dpdns.org/random?dir=backimg";
const CDN_BASE = "https://img.hdx.dpdns.org";
const ROTATE_INTERVAL = 7000; // 7 秒自动换图

const $vfA = document.getElementById("vfImgA");
const $vfB = document.getElementById("vfImgB");
const $status = document.getElementById("vfStatus");
const $flash = document.getElementById("flash");
const $shutter = document.getElementById("shutterBtn");
const $shutterHint = document.getElementById("shutterHint");
const $tray = document.getElementById("tray");
const $trayEmpty = document.getElementById("trayEmpty");

// 预加载池：当前显示 + 下一个待命
const pool = []; // {url, img}
let activeLayer = "A";
let currentUrl = null;
let rotateTimer = null;
let developing = false;

async function fetchRandomUrl() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (!data || typeof data.url !== "string") throw new Error("bad response");
  return CDN_BASE + data.url;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ url, img });
    img.onerror = () => reject(new Error("image load failed: " + url));
    img.src = url;
  });
}

// 拉一张新图并预加载进池子
async function refill() {
  try {
    const url = await fetchRandomUrl();
    if (pool.some((p) => p.url === url)) return; // 去重
    const entry = await loadImage(url);
    pool.push(entry);
  } catch (err) {
    console.warn("refill failed:", err);
  }
}

// 池子始终保持至少 2 张待命
async function ensurePool() {
  while (pool.length < 2) {
    const before = pool.length;
    await refill();
    if (pool.length === before) break; // 防止死循环
  }
}

function setStatus(text) {
  $status.textContent = text;
}

// 切换取景器图片（交叉淡入淡出）
function showInViewfinder(url, img) {
  const next = activeLayer === "A" ? $vfB : $vfA;
  const prev = activeLayer === "A" ? $vfA : $vfB;
  next.src = img.src;
  next.classList.add("is-active");
  prev.classList.remove("is-active");
  activeLayer = activeLayer === "A" ? "B" : "A";
  currentUrl = url;
  setStatus("● LIVE");
}

async function nextFrame() {
  await ensurePool();
  const entry = pool.shift();
  if (!entry) return;
  showInViewfinder(entry.url, entry.img);
  // 立即发起下一次请求，确保切图时无需等待
  refill();
}

function startRotation() {
  if (rotateTimer) clearInterval(rotateTimer);
  rotateTimer = setInterval(nextFrame, ROTATE_INTERVAL);
}

// ===== 拍照 =====
function fireFlash() {
  $flash.classList.remove("is-firing");
  // 强制重排以重启动画
  void $flash.offsetWidth;
  $flash.classList.add("is-firing");
}

function stampTime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function shoot() {
  if (developing) return;
  if (!currentUrl) {
    $shutterHint.textContent = "还没取好景…";
    return;
  }
  developing = true;
  fireFlash();
  $shutterHint.textContent = "正在显影…";
  $shutter.disabled = true;

  if ($trayEmpty) $trayEmpty.style.display = "none";

  const polaroid = document.createElement("div");
  polaroid.className = "polaroid";

  const frame = document.createElement("div");
  frame.className = "polaroid__window";

  const img = document.createElement("img");
  img.className = "polaroid__img";
  img.alt = "橘猫";
  img.src = currentUrl;

  const veil = document.createElement("div");
  veil.className = "polaroid__veil";

  const caption = document.createElement("div");
  caption.className = "polaroid__caption";
  caption.textContent = stampTime();

  frame.appendChild(img);
  frame.appendChild(veil);
  polaroid.appendChild(frame);
  polaroid.appendChild(caption);
  $tray.prepend(polaroid);

  // 触发显影：下一帧移除未显影状态，CSS 过渡接管
  requestAnimationFrame(() => {
    setTimeout(() => polaroid.classList.add("is-developed"), 200);
  });

  const onDone = () => {
    developing = false;
    $shutter.disabled = false;
    $shutterHint.textContent = "按下快门";
  };
  // 出片 + 显影总时长（CSS transition 4.5s + eject 0.6s + 缓冲）
  setTimeout(onDone, 5200);
}

$shutter.addEventListener("click", shoot);

// 键盘空格也可拍照
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement.tagName !== "BUTTON") {
    e.preventDefault();
    shoot();
  }
});

// ===== 初始化 =====
(async function init() {
  setStatus("取景中…");
  // 并行预取两张，确保首屏有图
  await Promise.all([refill(), refill()]);
  await nextFrame();
  startRotation();
})();
