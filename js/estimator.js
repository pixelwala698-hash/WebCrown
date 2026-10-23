import { localDataStore } from "./data-store.js";
import { calculateQuote, createRecordId, formatRupees, getActiveRates } from "./quote.js";

const recipients = [
  { id: "quote-bhavesh", name: "Bhavesh Bobde", phone: "919822734707", label: "estimator.sendBhavesh" },
  { id: "quote-grishma", name: "Grishma Parshivnikar", phone: "918600103414", label: "estimator.sendGrishma" },
];

export function initializeEstimator(getText) {
  const businessSelect = document.getElementById("estimate-business");
  const pageInput = document.getElementById("estimate-pages");
  const featuresContainer = document.getElementById("estimate-features");
  const languagesContainer = document.getElementById("estimate-languages");
  const deliveryContainer = document.getElementById("estimate-delivery");
  const breakdownOutput = document.getElementById("estimate-breakdown");
  const errorOutput = document.getElementById("estimate-error");
  let latestQuote;

  function checkedIds(container, selector) {
    return [...container.querySelectorAll(`${selector}:checked`)].map((input) => input.value);
  }

  function renderOptions() {
    const rates = getActiveRates();
    const currentBusiness = businessSelect.value;
    const currentFeatures = new Set(checkedIds(featuresContainer, "input"));
    const currentLanguages = new Set(checkedIds(languagesContainer, "input"));
    const currentDelivery = deliveryContainer.querySelector("input:checked")?.value ?? "normal";

    businessSelect.replaceChildren(...rates.businessTypes.map(({ id, labelKey }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = getText(labelKey);
      return option;
    }));
    businessSelect.value = rates.businessTypes.some(({ id }) => id === currentBusiness) ? currentBusiness : "restaurant";

    featuresContainer.replaceChildren(...rates.features.map(({ id, labelKey, price }) => {
      const label = document.createElement("label");
      label.className = "estimate-feature estimate-choice";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.checked = currentFeatures.has(id);
      const title = document.createElement("span");
      title.textContent = getText(labelKey);
      const amount = document.createElement("span");
      amount.className = "feature-price";
      amount.textContent = getText("estimate.price", { amount: formatRupees(price) });
      label.append(checkbox, title, amount);
      return label;
    }));

    languagesContainer.className = "estimate-choice-grid";
    languagesContainer.replaceChildren(...rates.languages.map(({ id, labelKey }) => {
      const label = document.createElement("label");
      label.className = "estimate-choice";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.checked = currentLanguages.size ? currentLanguages.has(id) : id === "en";
      const text = document.createElement("span");
      text.textContent = getText(labelKey);
      label.append(checkbox, text);
      return label;
    }));

    deliveryContainer.replaceChildren(...Object.entries(rates.delivery).map(([id, delivery]) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "estimate-delivery-choice";
      radio.value = id;
      radio.checked = id === currentDelivery;
      const text = document.createElement("span");
      text.textContent = getText(delivery.labelKey, { days: delivery.days });
      label.append(radio, text);
      return label;
    }));
    calculate();
  }

  function readOptions() {
    return {
      businessId: businessSelect.value,
      pages: Number(pageInput.value),
      featureIds: checkedIds(featuresContainer, "input"),
      languageIds: checkedIds(languagesContainer, "input"),
      deliveryId: deliveryContainer.querySelector("input:checked")?.value ?? "normal",
    };
  }

  function calculate() {
    errorOutput.hidden = true;
    pageInput.removeAttribute("aria-invalid");
    try {
      latestQuote = calculateQuote(readOptions(), getActiveRates());
      document.getElementById("amt").textContent =
        `${formatRupees(latestQuote.rangeLow)} – ${formatRupees(latestQuote.rangeHigh)}`;
      document.getElementById("estimate-days").textContent =
        getText(latestQuote.deliveryLabelKey, { days: latestQuote.deliveryDays });
      breakdownOutput.replaceChildren(...latestQuote.breakdown.map((item) => {
        const line = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = getText(item.key, item.quantity ? { quantity: item.quantity } : {});
        const amount = document.createElement("strong");
        amount.textContent = formatRupees(item.amount);
        line.append(label, amount);
        return line;
      }));
    } catch (error) {
      latestQuote = null;
      pageInput.setAttribute("aria-invalid", "true");
      errorOutput.textContent = error.message.includes("language")
        ? getText("estimator.languageError")
        : getText("estimator.pagesError");
      errorOutput.hidden = false;
    }
  }

  function sendQuote(recipient) {
    calculate();
    if (!latestQuote) return;
    const name = document.getElementById("quote-name").value.trim();
    const record = {
      ...latestQuote,
      id: createRecordId(),
      date: new Date().toISOString(),
      customerName: name,
    };
    if (!localDataStore.saveQuote(record)) {
      errorOutput.textContent = getText("estimator.quoteSavedError");
      errorOutput.hidden = false;
      return;
    }
    const message = getText("whatsapp.quote", {
      name: name || getText("admin.noName"),
      business: getText(latestQuote.businessLabelKey),
      pages: latestQuote.pages,
      features: latestQuote.selectedFeatures.length
        ? latestQuote.selectedFeatures.map(({ labelKey }) => getText(labelKey)).join(", ")
        : getText("whatsapp.no-features"),
      languages: latestQuote.selectedLanguages.map(({ labelKey }) => getText(labelKey)).join(", "),
      delivery: getText(latestQuote.deliveryLabelKey, { days: latestQuote.deliveryDays }),
      range: `${formatRupees(latestQuote.rangeLow)} – ${formatRupees(latestQuote.rangeHigh)}`,
      days: latestQuote.deliveryDays,
    });
    window.open(`https://wa.me/${recipient.phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  businessSelect.addEventListener("change", calculate);
  pageInput.addEventListener("input", calculate);
  featuresContainer.addEventListener("change", calculate);
  languagesContainer.addEventListener("change", calculate);
  deliveryContainer.addEventListener("change", calculate);
  recipients.forEach((recipient) => {
    const button = document.getElementById(recipient.id);
    button.addEventListener("click", () => sendQuote(recipient));
  });
  document.addEventListener("webcrown:languagechange", renderOptions);
  renderOptions();
}
