// Feature flags for provider integrations
export const FEATURE_FLAGS = {
  ENABLE_GOOGLE_PLACES: process.env.GOOGLE_PLACES_API_KEY ? true : false,
  ENABLE_OPENWEATHER: process.env.OPENWEATHER_API_KEY ? true : false,
  ENABLE_TRIPADVISOR: process.env.TRIPADVISOR_API_KEY ? true : false,
  ENABLE_TBO: process.env.TBO_API_KEY ? true : false,
  ENABLE_REST_COUNTRIES: true, // Free API, always enabled
  ENABLE_GEONAMES: process.env.GEONAMES_USERNAME ? true : false,
} as const;

export function isProviderEnabled(provider: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[provider];
}

export function getEnabledProviders() {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([provider]) => provider);
}
