import siteConfig from "../config/site-config.json";
import { getSupabaseClient, isSupabaseConfigured, signInWithPassword, signOut } from "./supabase.js";
import { localDataStore } from "./data-store.js";
import { calculateQuote, formatRupees } from "./quote.js";

function validRates(rates) {
  if (!rates || typeof rates !== "object" || !Array.isArray(rates.businessTypes)
    || !Array.isArray(rates.features) || !Array.isArray(rates.languages)
    || !rates.businessTypes.length || !rates.features.length || !rates.languages.length
    || !rates.delivery || !rates.range) return false;
  const amounts = [rates.baseFee, rates.perPage, rates.range.lowMultiplier, rates.range.highMultiplier, rates.range.roundingStep];
  const choices = [...rates.businessTypes, ...rates.features, ...rates.languages];
  if (!amounts.every((value) => Number.isFinite(value) && value >= 0)) return false;
  if (!choices.every((choice) => choice && typeof choice.id === "string" && choice.id
    && typeof choice.labelKey === "string"
    && typeof (choice.price ?? choice.baseFee) === "number"
    && Number.isFinite(choice.price ?? choice.baseFee) && (choice.price ?? choice.baseFee) >= 0)) return false;
  for (const group of [rates.businessTypes, rates.features, rates.languages]) {
    if (new Set(group.map(({ id }) => id)).size !== group.length) return false;
  }
  if (!["normal", "rush"].every((id) => {
    const option = rates.delivery[id];
    return option && typeof option.labelKey === "string" && Number.isInteger(option.days) && option.days >= 1
      && Number.isFinite(option.multiplier) && option.multiplier >= 0;
  })) return false;
  return rates.range.highMultiplier >= rates.range.lowMultiplier && rates.range.roundingStep > 0;
}

function setPath(object, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const parent = parts.reduce((current, key) => current[key], object);
  parent[last] = value;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function initializeAdmin(getText) {
  document.body.classList.add("admin-mode");
  document.getElementById("admin-root").hidden = false;
  document.querySelector(".main-nav").hidden = true;
  document.querySelector(".brand").href = "../";
  const root = document.getElementById("admin-root");
  let rates = localDataStore.getRates();

  async function renderLogin(error = "") {
    root.replaceChildren();
    const panel = makeElement("section", "admin-panel glass-card");
    const eyebrow = makeElement("p", "eyebrow", getText("admin.title"));
    const heading = makeElement("h1", "", getText("admin.locked"));
    const form = makeElement("form", "admin-login");
    form.autocomplete = "off";

    const supabaseEnabled = isSupabaseConfigured();
    const errorNode = makeElement("p", "form-error", error);
    errorNode.hidden = !error;
    errorNode.setAttribute("role", "alert");

    if (supabaseEnabled) {
      const emailLabel = makeElement("label", "", getText("admin.auth.email"));
      emailLabel.htmlFor = "admin-email";
      const emailInput = makeElement("input");
      emailInput.id = "admin-email";
      emailInput.type = "email";
      emailInput.autocomplete = "email";
      emailInput.required = true;

      const passwordLabel = makeElement("label", "", getText("admin.auth.password"));
      passwordLabel.htmlFor = "admin-password";
      const passwordInput = makeElement("input");
      passwordInput.id = "admin-password";
      passwordInput.type = "password";
      passwordInput.autocomplete = "current-password";
      passwordInput.required = true;

      const submit = makeElement("button", "button button-primary", getText("admin.auth.submit"));
      submit.type = "submit";

      form.append(emailLabel, emailInput, passwordLabel, passwordInput, submit, errorNode);
      panel.append(eyebrow, heading, form);
      root.append(panel);

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password) {
          errorNode.textContent = getText("admin.auth.error");
          errorNode.hidden = false;
          return;
        }
        const { error: authError } = await signInWithPassword(email, password);
        if (authError) {
          errorNode.textContent = authError.message || getText("admin.auth.error");
          errorNode.hidden = false;
          passwordInput.focus();
          return;
        }
        renderDashboard();
      });
      return;
    }

    const label = makeElement("label", "", getText("admin.pin.label"));
    label.htmlFor = "admin-pin";
    const pin = makeElement("input");
    pin.id = "admin-pin";
    pin.type = "password";
    pin.inputMode = "numeric";
    pin.autocomplete = "current-password";
    pin.required = true;
    const submit = makeElement("button", "button button-primary", getText("admin.pin.submit"));
    submit.type = "submit";

    form.append(label, pin, submit, errorNode);
    panel.append(eyebrow, heading, form);
    root.append(panel);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!globalThis.crypto?.subtle) {
        console.error("Web Crypto is unavailable; the admin PIN cannot be verified.");
        errorNode.textContent = getText("admin.pin.unavailable");
        errorNode.hidden = false;
        return;
      }
      const bytes = new TextEncoder().encode(pin.value);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      if (hash !== siteConfig.adminPinSha256) {
        errorNode.textContent = getText("admin.pin.error");
        errorNode.hidden = false;
        pin.focus();
        return;
      }
      renderDashboard();
    });
  }

  function addRateInput(container, labelText, value, path, min = 0, step = 100) {
    const wrapper = makeElement("label", "admin-rate-field");
    wrapper.append(makeElement("span", "", labelText));
    const input = makeElement("input");
    input.type = "number";
    input.min = String(min);
    input.step = String(step);
    input.value = String(value);
    input.dataset.ratePath = path;
    wrapper.append(input);
    container.append(wrapper);
  }

  function renderRateEditor(form) {
    const current = localDataStore.getRates();
    rates = structuredClone(current);
    form.replaceChildren();
    const baseGroup = makeElement("fieldset", "admin-rate-group");
    baseGroup.append(makeElement("legend", "", getText("admin.rates.title")));
    addRateInput(baseGroup, getText("admin.rates.base"), rates.baseFee, "baseFee");
    addRateInput(baseGroup, getText("admin.rates.page"), rates.perPage, "perPage");
    form.append(baseGroup);

    const groups = [
      { key: "admin.rates.business", path: "businessTypes", priceKey: "baseFee" },
      { key: "admin.rates.features", path: "features", priceKey: "price" },
      { key: "admin.rates.languages", path: "languages", priceKey: "price" },
    ];
    groups.forEach(({ key, path, priceKey }) => {
      const group = makeElement("fieldset", "admin-rate-group");
      group.append(makeElement("legend", "", getText(key)));
      rates[path].forEach((entry, index) => {
        addRateInput(group, getText(entry.labelKey), entry[priceKey], `${path}.${index}.${priceKey}`);
      });
      form.append(group);
    });

    const deliveryGroup = makeElement("fieldset", "admin-rate-group");
    deliveryGroup.append(makeElement("legend", "", getText("admin.rates.delivery")));
    addRateInput(deliveryGroup, getText("admin.rates.normalDays"), rates.delivery.normal.days, "delivery.normal.days", 1, 1);
    addRateInput(deliveryGroup, getText("admin.rates.normalMultiplier"), rates.delivery.normal.multiplier, "delivery.normal.multiplier", 0, 0.05);
    addRateInput(deliveryGroup, getText("admin.rates.rushDays"), rates.delivery.rush.days, "delivery.rush.days", 1, 1);
    addRateInput(deliveryGroup, getText("admin.rates.rushMultiplier"), rates.delivery.rush.multiplier, "delivery.rush.multiplier", 0, 0.05);
    addRateInput(deliveryGroup, getText("admin.rates.lowMultiplier"), rates.range.lowMultiplier, "range.lowMultiplier", 0, 0.05);
    addRateInput(deliveryGroup, getText("admin.rates.highMultiplier"), rates.range.highMultiplier, "range.highMultiplier", 0, 0.05);
    addRateInput(deliveryGroup, getText("admin.rates.roundingStep"), rates.range.roundingStep, "range.roundingStep", 0, 100);
    form.append(deliveryGroup);
  }

  function renderRecords(container) {
    container.replaceChildren();
    const quotes = localDataStore.getQuotes();
    const leads = localDataStore.getLeads();
    const groups = [
      { title: "admin.quotes", records: quotes, kind: "quote" },
      { title: "admin.leads", records: leads, kind: "lead" },
    ];
    groups.forEach(({ title, records, kind }) => {
      const section = makeElement("section", "admin-record-group");
      section.append(makeElement("h3", "", `${getText(title)} (${records.length})`));
      if (!records.length) section.append(makeElement("p", "admin-empty", getText("admin.empty")));
      records.forEach((record) => {
        const article = makeElement("article", "admin-record");
        const name = record.customerName || record.name || getText("admin.noName");
        article.append(makeElement("h4", "", name));
        article.append(makeElement("p", "", `${getText("admin.date")}: ${new Date(record.date).toLocaleString()}`));
        if (kind === "quote") {
          const choices = [
            `${getText("admin.options")}: ${getText(record.businessLabelKey)} · ${record.pages} ${getText("estimator.pages").toLowerCase()}`,
            `${getText("admin.options")}: ${record.selectedFeatures.map(({ labelKey }) => getText(labelKey)).join(", ") || getText("whatsapp.no-features")}`,
            `${getText("admin.options")}: ${record.selectedLanguages.map(({ labelKey }) => getText(labelKey)).join(", ")}`,
            `${getText("admin.range")}: ${formatRupees(record.rangeLow)} – ${formatRupees(record.rangeHigh)}`,
          ];
          choices.forEach((choice) => article.append(makeElement("p", "", choice)));
        } else {
          article.append(makeElement("p", "", `${getText("lead.phone")}: ${record.phone}`));
          article.append(makeElement("p", "", `${getText("lead.business")}: ${getText(record.businessLabelKey)}`));
          article.append(makeElement("p", "", `${getText("lead.message")}: ${record.message}`));
        }
        section.append(article);
      });
      container.append(section);
    });
  }

  function renderDashboard() {
    root.replaceChildren();
    const panel = makeElement("section", "admin-panel glass-card");
    const headingRow = makeElement("div", "admin-heading-row");
    const title = makeElement("div");
    title.append(makeElement("p", "eyebrow", getText("admin.title")));
    title.append(makeElement("h1", "", getText("admin.subtitle")));
    const logout = makeElement("button", "button button-quiet", getText("admin.logout"));
    logout.type = "button";
    logout.addEventListener("click", async () => {
      if (isSupabaseConfigured()) {
        const { error } = await signOut();
        if (error) {
          console.error("Supabase sign-out failed.", error);
        }
      }
      renderLogin();
    });
    headingRow.append(title, logout);
    panel.append(headingRow);

    const ratesTitle = makeElement("h2", "", getText("admin.rates.title"));
    const rateForm = makeElement("form", "admin-rate-form");
    const message = makeElement("p", "admin-status");
    message.setAttribute("role", "status");
    const save = makeElement("button", "button button-primary", getText("admin.save"));
    save.type = "submit";
    rateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = structuredClone(rates);
      rateForm.querySelectorAll("[data-rate-path]").forEach((input) => {
        setPath(updated, input.dataset.ratePath, Number(input.value));
      });
      if (!validRates(updated)) {
        message.textContent = getText("admin.validation");
        message.className = "admin-status form-error";
        return;
      }
      if (!localDataStore.saveRates(updated)) {
        message.textContent = getText("admin.storageError");
        message.className = "admin-status form-error";
        return;
      }
      rates = updated;
      message.textContent = getText("admin.saved");
      message.className = "admin-status";
      renderPreview();
    });
    renderRateEditor(rateForm);
    rateForm.append(save);
    panel.append(ratesTitle, rateForm, message);

    const tools = makeElement("div", "admin-tools");
    const exportButton = makeElement("button", "button button-quiet", getText("admin.export"));
    exportButton.type = "button";
    exportButton.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(localDataStore.getRates(), null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "webcrown-rates.json";
      link.click();
      URL.revokeObjectURL(link.href);
    });
    const importLabel = makeElement("label", "button button-quiet", getText("admin.import"));
    const fileInput = makeElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.className = "sr-only";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        if (!validRates(imported)) throw new Error("Rates schema is invalid.");
        if (!localDataStore.saveRates(imported)) {
          message.textContent = getText("admin.storageError");
          message.className = "admin-status form-error";
          return;
        }
        rates = imported;
        renderRateEditor(rateForm);
        rateForm.append(save);
        message.textContent = getText("admin.importSuccess");
        message.className = "admin-status";
        renderPreview();
      } catch (error) {
        console.error("Could not import WebCrown rates.", error);
        message.textContent = getText("admin.importError");
        message.className = "admin-status form-error";
      }
    });
    importLabel.append(fileInput);
    tools.append(exportButton, importLabel);
    panel.append(tools);

    const preview = makeElement("section", "admin-preview admin-rate-group");
    preview.append(makeElement("h2", "", getText("admin.preview.title")));
    const previewOutput = makeElement("div", "admin-preview-output");
    const previewButton = makeElement("button", "button button-quiet", getText("admin.preview"));
    previewButton.type = "button";
    previewButton.addEventListener("click", renderPreview);
    preview.append(previewOutput, previewButton);
    function renderPreview() {
      try {
        const sample = calculateQuote({
          businessId: rates.businessTypes[0].id,
          pages: 5,
          featureIds: [],
          languageIds: [rates.languages[0].id],
          deliveryId: "normal",
        }, rates);
        previewOutput.textContent =
          `${getText("admin.range")}: ${formatRupees(sample.rangeLow)} – ${formatRupees(sample.rangeHigh)} · ${getText(sample.deliveryLabelKey, { days: sample.deliveryDays })}`;
      } catch (error) {
        console.error("Could not calculate the admin preview.", error);
        previewOutput.textContent = getText("admin.validation");
      }
    }
    panel.append(preview);

    const records = makeElement("div", "admin-records admin-rate-group");
    records.append(makeElement("h2", "", getText("admin.records.title")));
    renderRecords(records);
    panel.append(records);
    const home = makeElement("a", "button button-quiet admin-home", getText("admin.home"));
    home.href = "../";
    panel.append(home);
    root.append(panel);
    renderPreview();
  }

  document.addEventListener("webcrown:languagechange", () => {
    if (root.querySelector(".admin-login")) renderLogin();
    else renderDashboard();
  });
  // A browser-only PIN is a light lock, not real security; rates and records remain accessible to site visitors.
  renderLogin();
}
