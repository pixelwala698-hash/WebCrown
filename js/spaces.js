import hotelLobbyImage from "../assets/interiors/hotel-lobby.webp?url";
import hotelSuiteImage from "../assets/interiors/hotel-suite.webp?url";
import restaurantImage from "../assets/interiors/restaurant.webp?url";
import cafeImage from "../assets/interiors/cafe.webp?url";
import gymImage from "../assets/interiors/gym.jpg?url";
import salonImage from "../assets/interiors/salon.jpg?url";
import boutiqueImage from "../assets/interiors/boutique.jpg?url";
import bakeryImage from "../assets/interiors/bakery.jpg?url";
import coachingImage from "../assets/interiors/coaching.jpg?url";
import furnitureImage from "../assets/interiors/furniture.jpg?url";
import brandStoreImage from "../assets/interiors/brand-store.jpg?url";

const spaceDefinitions = [
  { id: "hotel-lobby", asset: hotelLobbyImage, accent: "#f2bd62" },
  { id: "hotel-suite", asset: hotelSuiteImage, accent: "#d8b87a" },
  { id: "restaurant", asset: restaurantImage, accent: "#cd7eb1" },
  { id: "cafe", asset: cafeImage, accent: "#c89467" },
  { id: "gym", asset: gymImage, accent: "#73d6da" },
  { id: "salon", asset: salonImage, accent: "#d5a1bd" },
  { id: "boutique", asset: boutiqueImage, accent: "#e2c58f" },
  { id: "bakery", asset: bakeryImage, accent: "#e8a872" },
  { id: "coaching", asset: coachingImage, accent: "#8bc4b0" },
  { id: "furniture", asset: furnitureImage, accent: "#c7aa80" },
  { id: "brand-store", asset: brandStoreImage, accent: "#a89ae2" },
];

const hotspotKinds = ["services", "booking", "quote"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
let rendererPromise;
let THREE;
let scene;
let camera;
let panorama;
let currentTexture;
const panoramaTextures = new WeakMap();
let activeSection;
let frameId;
let longitude = 0;
let latitude = 0;
let dragging = false;
let previousPointerX = 0;
let previousPointerY = 0;

function whatsappUrl(message) {
  return `https://wa.me/919822734707?text=${encodeURIComponent(message)}`;
}

function createSpaceMarkup({ id, asset, accent }, index) {
  return `
    <article class="space" id="space-${id}" data-space-id="${id}" style="--space-accent:${accent}">
      <div class="space-visual">
        <div class="space-placeholder" aria-hidden="true"><span data-i18n="space.${id}.title"></span></div>
        <img class="space-image" data-source="${asset}"
          loading="lazy" decoding="async"
          data-i18n-alt="space.${id}.alt">
      </div>
      <div class="space-copy glass-card">
        <p class="eyebrow" data-i18n="spaces.label"></p>
        <h2 data-i18n="space.${id}.title"></h2>
        <p data-i18n="space.${id}.description"></p>
        <div class="space-hotspots">
          ${hotspotKinds.map((kind) => `
            <button class="hotspot-button" type="button" data-hotspot="${kind}" aria-expanded="false"
              aria-controls="hotspot-${id}" data-i18n="hotspot.${kind}"></button>
          `).join("")}
        </div>
        <div class="hotspot-card" id="hotspot-${id}" hidden aria-live="polite">
          <h3></h3><p></p><a class="button button-primary" target="_blank" rel="noopener noreferrer"></a>
        </div>
      </div>
      <p class="space-index" aria-hidden="true"><strong>${String(index + 1).padStart(2, "0")}</strong> / ${String(spaceDefinitions.length).padStart(2, "0")}</p>
    </article>`;
}

function initializeRenderer() {
  if (renderer) return Promise.resolve(true);
  if (rendererPromise) return rendererPromise;
  rendererPromise = (async () => {
    try {
      THREE = await import("three");
    } catch (error) {
      console.error("Failed to load bundled Three.js; using the static image fallback.", error);
      return false;
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (error) {
      console.info("WebGL is unavailable; interior panoramas will use their static image fallback.", error);
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1100);
    renderer.domElement.className = "pano-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    scene = new THREE.Scene();
    camera.position.set(0, 0, 0.1);
    const sphere = new THREE.SphereGeometry(500, 64, 40);
    sphere.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    panorama = new THREE.Mesh(sphere, material);
    scene.add(panorama);
    renderer.domElement.addEventListener("pointerdown", beginDrag);
    renderer.domElement.addEventListener("pointermove", moveDrag);
    renderer.domElement.addEventListener("pointerup", endDrag);
    renderer.domElement.addEventListener("pointercancel", endDrag);
    renderer.domElement.addEventListener("pointerleave", endDrag);
    return true;
  })();
  return rendererPromise;
}

function beginDrag(event) {
  if (!activeSection?.dataset.panorama) return;
  dragging = true;
  previousPointerX = event.clientX;
  previousPointerY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!dragging) return;
  longitude -= (event.clientX - previousPointerX) * 0.12;
  latitude += (event.clientY - previousPointerY) * 0.12;
  latitude = THREE.MathUtils.clamp(latitude, -80, 80);
  previousPointerX = event.clientX;
  previousPointerY = event.clientY;
  startRenderLoop();
}

function endDrag() {
  dragging = false;
}

function activatePanorama(section) {
  if (!renderer || !section?.dataset.panorama || !section.dataset.textureReady) return;
  const texture = panoramaTextures.get(section);
  if (texture && texture !== currentTexture) {
    currentTexture?.dispose();
    currentTexture = texture;
    panorama.material.map = texture;
    texture.needsUpdate = true;
    panorama.material.color.set(0xffffff);
    panorama.material.needsUpdate = true;
  }
  if (renderer.domElement.parentElement !== section.querySelector(".space-visual")) {
    section.querySelector(".space-visual").append(renderer.domElement);
  }
  renderer.domElement.hidden = false;
  section.querySelector(".space-placeholder").hidden = true;
  section.querySelector(".space-image").classList.add("is-panorama");
  startRenderLoop();
}

function startRenderLoop() {
  if (!renderer || !activeSection?.dataset.panorama || document.hidden || frameId !== undefined) return;
  const render = () => {
    frameId = undefined;
    if (!renderer || !activeSection?.dataset.panorama || document.hidden) return;
    if (!dragging && !reducedMotion) longitude += 0.025;
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude);
    camera.lookAt(
      500 * Math.sin(phi) * Math.sin(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.cos(theta),
    );
    renderer.render(scene, camera);
    if (!reducedMotion) frameId = window.requestAnimationFrame(render);
  };
  frameId = window.requestAnimationFrame(render);
}

function updateActiveSpace(entries) {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
  if (!visible) return;
  activeSection = visible.target;
  document.querySelectorAll(".space.is-active").forEach((space) => space.classList.remove("is-active"));
  activeSection.classList.add("is-active");
  if (activeSection.dataset.panorama === "true") {
    activatePanorama(activeSection);
  } else {
    renderer?.domElement.remove();
    if (renderer) renderer.domElement.hidden = true;
  }
}

function loadSpace(section) {
  if (section.dataset.loadStarted) return;
  section.dataset.loadStarted = "true";
  const image = section.querySelector(".space-image");
  image.addEventListener("load", async () => {
    const ratio = image.naturalWidth / image.naturalHeight;
    const isPanorama = ratio >= 1.9 && ratio <= 2.1;
    image.classList.add("is-loaded");
    section.dataset.panorama = String(isPanorama);
    if (isPanorama && await initializeRenderer()) {
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      panoramaTextures.set(section, texture);
      section.dataset.textureReady = "true";
      if (section === activeSection) activatePanorama(section);
    } else {
      section.querySelector(".space-placeholder").hidden = true;
    }
    if (section === activeSection && !isPanorama) {
      renderer?.domElement.remove();
      if (renderer) renderer.domElement.hidden = true;
    }
  }, { once: true });
  image.addEventListener("error", () => {
    image.classList.remove("is-loaded");
    console.warn(`Interior image failed to load for "${section.dataset.spaceId}": ${image.dataset.source}`);
  });
  image.src = image.dataset.source;
}

function updateParallax() {
  if (reducedMotion || !activeSection) return;
  const image = activeSection.querySelector(".space-image");
  if (!image.classList.contains("is-panorama")) {
    const offset = activeSection.getBoundingClientRect().top * -0.035;
    image.style.setProperty("--scroll-parallax", `${offset}px`);
  }
}

function addHotspotHandlers(section, getText) {
  const card = section.querySelector(".hotspot-card");
  const title = card.querySelector("h3");
  const description = card.querySelector("p");
  const link = card.querySelector("a");
  section.querySelectorAll(".hotspot-button").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      section.querySelectorAll(".hotspot-button").forEach((other) => other.setAttribute("aria-expanded", "false"));
      if (open) {
        card.hidden = true;
        return;
      }
      button.setAttribute("aria-expanded", "true");
      title.textContent = getText(`hotspot.${button.dataset.hotspot}`);
      description.textContent = getText(`hotspot.${button.dataset.hotspot}.copy`);
      link.textContent = getText("hotspot.whatsapp");
      link.href = whatsappUrl(`${getText("whatsapp.greeting")} ${getText(`space.${section.dataset.spaceId}.title`)}`);
      card.hidden = false;
      link.focus();
    });
  });
}

export function initializeSpaces(getText) {
  const container = document.getElementById("spaces-list");
  container.innerHTML = spaceDefinitions.map(createSpaceMarkup).join("");
  container.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getText(element.dataset.i18n);
  });
  container.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.alt = getText(element.dataset.i18nAlt);
  });
  const sections = [...container.querySelectorAll(".space")];

  sections.forEach((section) => {
    addHotspotHandlers(section, getText);
    const loadObserver = new IntersectionObserver((entries, observer) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        loadSpace(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "1000px 0px" });
    loadObserver.observe(section);
  });

  const activeObserver = new IntersectionObserver(updateActiveSpace, { threshold: [0.2, 0.45, 0.7] });
  sections.forEach((section) => activeObserver.observe(section));
  window.addEventListener("resize", () => {
    if (!renderer) return;
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  window.addEventListener("scroll", updateParallax, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      frameId = undefined;
    } else {
      startRenderLoop();
    }
  });
  document.addEventListener("webcrown:languagechange", () => {
    sections.forEach((section) => {
      const card = section.querySelector(".hotspot-card");
      if (!card.hidden) {
        const button = section.querySelector('.hotspot-button[aria-expanded="true"]');
        if (button) {
          card.querySelector("h3").textContent = getText(`hotspot.${button.dataset.hotspot}`);
          card.querySelector("p").textContent = getText(`hotspot.${button.dataset.hotspot}.copy`);
          card.querySelector("a").textContent = getText("hotspot.whatsapp");
          card.querySelector("a").href = whatsappUrl(
            `${getText("whatsapp.greeting")} ${getText(`space.${section.dataset.spaceId}.title`)}`,
          );
        }
      }
    });
  });
}
