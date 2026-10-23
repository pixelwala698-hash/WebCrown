import baseRates from "../data/rates.json";
import { localDataStore } from "./data-store.js";

export function getActiveRates() {
  return localDataStore.getRates();
}

export function calculateQuote(options, rates = baseRates) {
  const business = rates.businessTypes.find(({ id }) => id === options.businessId);
  const delivery = rates.delivery[options.deliveryId];
  if (!business || !delivery) throw new Error("Quote options contain an unsupported business or delivery choice.");
  if (!Number.isInteger(options.pages) || options.pages < 1 || options.pages > 30) {
    throw new Error("Page count must be between 1 and 30.");
  }

  const features = rates.features.filter(({ id }) => options.featureIds.includes(id));
  const languages = rates.languages.filter(({ id }) => options.languageIds.includes(id));
  if (languages.length === 0) throw new Error("Select at least one website language.");

  const breakdown = [
    { key: "estimator.breakdown.base", amount: rates.baseFee + business.baseFee },
    { key: "estimator.breakdown.pages", amount: options.pages * rates.perPage, quantity: options.pages },
    ...features.map(({ id, price }) => ({ key: "estimate.feature." + id, amount: price })),
    ...languages.filter(({ price }) => price > 0).map(({ id, price }) => ({
      key: "language.native." + id,
      amount: price,
    })),
  ];
  const subtotal = breakdown.reduce((total, item) => total + item.amount, 0);
  const adjusted = subtotal * delivery.multiplier;
  const low = Math.round((adjusted * rates.range.lowMultiplier) / rates.range.roundingStep) * rates.range.roundingStep;
  const high = Math.round((adjusted * rates.range.highMultiplier) / rates.range.roundingStep) * rates.range.roundingStep;
  return {
    ...options,
    businessLabelKey: business.labelKey,
    businessFee: business.baseFee,
    selectedFeatures: features,
    selectedLanguages: languages,
    breakdown,
    subtotal,
    deliveryLabelKey: delivery.labelKey,
    deliveryDays: delivery.days,
    rangeLow: Math.min(low, high),
    rangeHigh: Math.max(low, high),
  };
}

export function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function createRecordId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
