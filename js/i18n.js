const localeModules = import.meta.glob("../i18n/*.json", { eager: true, import: "default" });
const translations = Object.fromEntries(
  Object.entries(localeModules).map(([path, dictionary]) => [
    path.split("/").at(-1).replace(".json", ""),
    dictionary,
  ]),
);

export const languages = [
  { code: "en", lang: "en" },
  { code: "hi", lang: "hi" },
  { code: "mr", lang: "mr" },
  { code: "ta", lang: "ta" },
  { code: "gu", lang: "gu" },
  { code: "hinglish", lang: "hi-Latn" },
];

export const LANGUAGE_STORAGE_KEY = "webcrown-language";
let currentLanguage = "en";

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      console.warn("Local storage is unavailable; language selection will not persist in this context.");
      return null;
    }
    throw error;
  }
}

function saveLanguage(code) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch (error) {
    if (error instanceof DOMException && (error.name === "SecurityError" || error.name === "QuotaExceededError")) {
      console.warn("Could not save the selected language; it will apply for this page session only.");
      return;
    }
    throw error;
  }
}

export function getLanguage() {
  return currentLanguage;
}

export function getText(key, values = {}) {
  const dictionary = translations[currentLanguage] ?? translations.en;
  let text = dictionary[key] ?? translations.en[key];
  if (text === undefined) {
    console.error(`Missing WebCrown translation key: ${key}`);
    return key;
  }
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

function updateDocument() {
  const dictionary = translations[currentLanguage] ?? translations.en;
  const title = dictionary["document.title"] ?? translations.en["document.title"];
  const description = dictionary["meta.description"] ?? translations.en["meta.description"];
  const ogTitle = dictionary["meta.og.title"] ?? title;
  const ogDescription = dictionary["meta.og.description"] ?? description;
  const twitterTitle = dictionary["meta.twitter.title"] ?? title;
  const twitterDescription = dictionary["meta.twitter.description"] ?? description;

  document.documentElement.lang = languages.find((language) => language.code === currentLanguage)?.lang ?? "en";
  document.body.dataset.locale = currentLanguage;
  document.title = title;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;

  const metaOgTitle = document.querySelector('meta[property="og:title"]');
  if (metaOgTitle) metaOgTitle.setAttribute("content", ogTitle);
  const metaOgDescription = document.querySelector('meta[property="og:description"]');
  if (metaOgDescription) metaOgDescription.setAttribute("content", ogDescription);
  const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (metaTwitterTitle) metaTwitterTitle.setAttribute("content", twitterTitle);
  const metaTwitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (metaTwitterDescription) metaTwitterDescription.setAttribute("content", twitterDescription);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", dictionary["meta.canonical"] ?? translations.en["meta.canonical"] ?? "https://webcrown.example.com/");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getText(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", getText(element.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", getText(element.dataset.i18nAlt));
  });
}

export function setLanguage(code) {
  if (!languages.some((language) => language.code === code) || !translations[code]) {
    console.error(`Unsupported WebCrown language: ${code}`);
    return;
  }
  currentLanguage = code;
  saveLanguage(code);
  updateDocument();
  document.dispatchEvent(new CustomEvent("webcrown:languagechange", { detail: { language: code } }));
}

function buildLanguageControls() {
  const switcher = document.getElementById("language-switcher");
  const options = document.getElementById("language-options");
  languages.forEach(({ code }) => {
    const option = document.createElement("option");
    option.value = code;
    option.dataset.languageCode = code;
    switcher.append(option);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-option";
    button.dataset.languageCode = code;
    button.innerHTML = `<strong data-language-native="${code}"></strong><span data-language-english="${code}"></span>`;
    button.addEventListener("click", () => {
      setLanguage(code);
      document.getElementById("language-overlay").hidden = true;
      document.getElementById("language-switcher").focus();
    });
    options.append(button);
  });
  switcher.addEventListener("change", () => setLanguage(switcher.value));
}

function updateLanguageLabels() {
  const switcher = document.getElementById("language-switcher");
  languages.forEach(({ code }) => {
    const option = switcher.querySelector(`option[value="${code}"]`);
    const nativeName = getText(`language.native.${code}`);
    option.textContent = nativeName;
    option.setAttribute("aria-label", getText(`language.english.${code}`));

    const button = document.querySelector(`.language-option[data-language-code="${code}"]`);
    button.querySelector("strong").textContent = nativeName;
    button.querySelector("span").textContent = getText(`language.english.${code}`);
  });
  switcher.value = currentLanguage;
}

export function initializeI18n() {
  buildLanguageControls();
  const storedLanguage = readSavedLanguage();
  if (languages.some((language) => language.code === storedLanguage) && translations[storedLanguage]) {
    currentLanguage = storedLanguage;
    document.getElementById("language-overlay").hidden = true;
  } else {
    currentLanguage = "en";
    document.getElementById("language-overlay").hidden = false;
  }
  updateDocument();
  updateLanguageLabels();
  document.addEventListener("webcrown:languagechange", updateLanguageLabels);
  const overlay = document.getElementById("language-overlay");
  if (!overlay.hidden) {
    overlay.querySelector(".language-option").focus();
  }
  overlay.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const buttons = [...overlay.querySelectorAll(".language-option")];
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  return getText;
}
