import projects from "../data/projects.json";
import siteConfig from "../config/site-config.json";
import cafe from "../assets/interiors/cafe.webp?url";
import gym from "../assets/interiors/gym.jpg?url";
import hotelLobby from "../assets/interiors/hotel-lobby.webp?url";
import restaurant from "../assets/interiors/restaurant.webp?url";
import { getText } from "./i18n.js";

const projectImages = { cafe, gym, "hotel-lobby": hotelLobby, restaurant };

function renderProjects() {
  const grid = document.getElementById("project-grid");
  grid.replaceChildren(...projects.map((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const imageWrap = document.createElement("div");
    imageWrap.className = "project-image-wrap";
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = projectImages[project.imageKey] ?? restaurant;
    image.alt = getText(project.titleKey);
    image.loading = "lazy";
    image.decoding = "async";
    imageWrap.append(image);
    if (project.badgeKey) {
      const badge = document.createElement("span");
      badge.className = "project-badge";
      badge.textContent = getText(project.badgeKey);
      imageWrap.append(badge);
    }

    const content = document.createElement("div");
    content.className = "project-body";
    const title = document.createElement("h3");
    title.textContent = getText(project.titleKey);
    const type = document.createElement("span");
    type.className = "project-type";
    type.textContent = getText(project.typeKey);
    const description = document.createElement("p");
    description.textContent = getText(project.descriptionKey);
    content.append(title, type, description);
    if (project.demoKey) {
      const link = document.createElement("a");
      link.className = "button button-primary";
      link.href = siteConfig.demos[project.demoKey];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = getText("project.aishwaryam.demo");
      content.append(link);
    }
    card.append(imageWrap, content);
    return card;
  }));
}

export function initializePortfolio() {
  renderProjects();
  document.addEventListener("webcrown:languagechange", renderProjects);
}
