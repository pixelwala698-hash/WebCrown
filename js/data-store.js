import baseRates from "../data/rates.json";

const keys = {
  rates: "webcrown-admin-rates",
  quotes: "webcrown-recent-quotes",
  leads: "webcrown-leads",
};

function readJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(fallback);
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      console.warn(`Local storage is unavailable while reading ${key}.`);
      return structuredClone(fallback);
    }
    if (error instanceof SyntaxError) {
      console.error(`Stored WebCrown data for ${key} is invalid JSON.`, error);
      return structuredClone(fallback);
    }
    throw error;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof DOMException && (error.name === "SecurityError" || error.name === "QuotaExceededError")) {
      console.error(`Could not save WebCrown data for ${key}.`, error);
      return false;
    }
    throw error;
  }
}

export const localDataStore = {
  getRates: () => readJson(keys.rates, baseRates),
  saveRates: (rates) => writeJson(keys.rates, rates),
  getQuotes: () => readJson(keys.quotes, []),
  saveQuote(quote) {
    const quotes = this.getQuotes();
    quotes.unshift(quote);
    return writeJson(keys.quotes, quotes.slice(0, 100));
  },
  getLeads: () => readJson(keys.leads, []),
  saveLead(lead) {
    const leads = this.getLeads();
    leads.unshift(lead);
    return writeJson(keys.leads, leads.slice(0, 100));
  },
};
