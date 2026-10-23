import { getText, initializeI18n } from "./i18n.js";
import { initializeEstimator } from "./estimator.js";
import { initializeAdmin } from "./admin.js";
import { initializeLeadForm } from "./leads.js";
import { initializePortfolio } from "./portfolio.js";
import { initializeSpaces } from "./spaces.js";

const contacts = [
  { elementId: "waB", phone: "919822734707" },
  { elementId: "waG", phone: "918600103414" },
];

function updateContactLinks() {
  contacts.forEach(({ elementId, phone }) => {
    document.getElementById(elementId).href =
      `https://wa.me/${phone}?text=${encodeURIComponent(getText("whatsapp.greeting"))}`;
  });
}

initializeI18n();
const isAdminRoute = /\/admin\/?$/.test(window.location.pathname);
if (isAdminRoute) {
  initializeAdmin(getText);
} else {
  initializeSpaces(getText);
  initializeEstimator(getText);
  initializePortfolio();
  initializeLeadForm(getText);
  updateContactLinks();
  document.addEventListener("webcrown:languagechange", updateContactLinks);
}
document.getElementById("app-fallback").hidden = true;
