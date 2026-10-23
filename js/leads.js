import { localDataStore } from "./data-store.js";
import { createRecordId } from "./quote.js";

export function initializeLeadForm(getText) {
  const form = document.getElementById("lead-form");
  const business = document.getElementById("lead-business");
  const formError = document.getElementById("lead-form-error");

  function renderBusinessOptions() {
    const value = business.value;
    const rates = localDataStore.getRates();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getText("lead.business.choose");
    business.replaceChildren(placeholder, ...rates.businessTypes.map(({ id, labelKey }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = getText(labelKey);
      return option;
    }));
    business.value = value;
  }

  function setFieldError(field, errorElement, message) {
    errorElement.textContent = message;
    errorElement.hidden = !message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (!message) field.removeAttribute("aria-invalid");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formError.hidden = true;
    const name = document.getElementById("lead-name").value.trim();
    const phone = document.getElementById("lead-phone").value.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const businessId = business.value;
    const message = document.getElementById("lead-message").value.trim();
    const phoneError = phoneDigits.length >= 10 && phoneDigits.length <= 15
      ? ""
      : getText("lead.phoneError");
    const businessError = businessId ? "" : getText("lead.businessError");
    const messageError = message ? "" : getText("lead.messageError");
    setFieldError(document.getElementById("lead-phone"), document.getElementById("lead-phone-error"), phoneError);
    setFieldError(business, document.getElementById("lead-business-error"), businessError);
    setFieldError(document.getElementById("lead-message"), document.getElementById("lead-message-error"), messageError);
    if (phoneError || businessError || messageError) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const rates = localDataStore.getRates();
    const businessType = rates.businessTypes.find(({ id }) => id === businessId);
    const lead = {
      id: createRecordId(),
      date: new Date().toISOString(),
      name,
      phone,
      businessId,
      businessLabelKey: businessType.labelKey,
      message,
    };
    if (!localDataStore.saveLead(lead)) {
      formError.textContent = getText("lead.saveError");
      formError.hidden = false;
      return;
    }
    const contact = event.submitter?.value === "grishma" ? "918600103414" : "919822734707";
    const whatsappText = getText("whatsapp.lead", {
      name: name || getText("admin.noName"),
      phone,
      business: getText(businessType.labelKey),
      message,
    });
    window.open(`https://wa.me/${contact}?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener,noreferrer");
    form.reset();
    renderBusinessOptions();
  });

  document.addEventListener("webcrown:languagechange", renderBusinessOptions);
  renderBusinessOptions();
}
