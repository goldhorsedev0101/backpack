// Continents for destination selection
export const CONTINENTS = [
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Oceania",
  "Africa",
  "Caribbean"
] as const;

export type Continent = typeof CONTINENTS[number];

// Continent to Countries mapping
export const CONTINENT_COUNTRY_MAP: Record<Continent, readonly string[]> = {
  "Europe": [
    "France",
    "Italy",
    "Spain",
    "United Kingdom",
    "Germany",
    "Greece",
    "Portugal",
    "Netherlands",
    "Switzerland",
    "Austria",
    "Czech Republic",
    "Poland",
    "Ireland",
    "Croatia",
    "Iceland",
    "Norway",
    "Sweden",
    "Denmark",
    "Belgium",
    "Hungary"
  ],
  "Asia": [
    "Japan",
    "Thailand",
    "China",
    "South Korea",
    "Vietnam",
    "Indonesia",
    "Singapore",
    "Malaysia",
    "Philippines",
    "India",
    "United Arab Emirates",
    "Turkey",
    "Israel",
    "Jordan",
    "Sri Lanka",
    "Cambodia",
    "Nepal",
    "Maldives"
  ],
  "North America": [
    "United States",
    "Canada",
    "Mexico",
    "Costa Rica",
    "Panama"
  ],
  "South America": [
    "Brazil",
    "Argentina",
    "Peru",
    "Chile",
    "Colombia",
    "Ecuador",
    "Bolivia",
    "Uruguay",
    "Venezuela",
    "Paraguay",
    "Guyana",
    "Suriname"
  ],
  "Oceania": [
    "Australia",
    "New Zealand",
    "Fiji"
  ],
  "Africa": [
    "South Africa",
    "Morocco",
    "Egypt",
    "Kenya",
    "Tanzania",
    "Tunisia",
    "Mauritius"
  ],
  "Caribbean": [
    "Dominican Republic",
    "Jamaica",
    "Cuba",
    "Bahamas"
  ]
} as const;

// Global Countries for destination selection (organized by popularity and region)
export const WORLD_COUNTRIES = [
  ...CONTINENT_COUNTRY_MAP.Europe,
  ...CONTINENT_COUNTRY_MAP.Asia,
  ...CONTINENT_COUNTRY_MAP["North America"],
  ...CONTINENT_COUNTRY_MAP["South America"],
  ...CONTINENT_COUNTRY_MAP.Oceania,
  ...CONTINENT_COUNTRY_MAP.Africa,
  ...CONTINENT_COUNTRY_MAP.Caribbean
] as const;

export type WorldCountry = typeof WORLD_COUNTRIES[number];

// Helper functions
export function getCountriesByContinent(continent: Continent): readonly string[] {
  return CONTINENT_COUNTRY_MAP[continent];
}

export function getContinentByCountry(country: string): Continent | undefined {
  for (const [continent, countries] of Object.entries(CONTINENT_COUNTRY_MAP)) {
    if (countries.includes(country)) {
      return continent as Continent;
    }
  }
  return undefined;
}

// Legacy export for backward compatibility - kept as literal tuple for type safety
export const SOUTH_AMERICAN_COUNTRIES = [
  "Brazil",
  "Argentina",
  "Peru",
  "Chile",
  "Colombia",
  "Ecuador",
  "Bolivia",
  "Uruguay",
  "Venezuela",
  "Paraguay",
  "Guyana",
  "Suriname"
] as const;

export type SouthAmericanCountry = typeof SOUTH_AMERICAN_COUNTRIES[number];