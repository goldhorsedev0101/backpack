export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const airports: Airport[] = [
  // Israel
  { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },
  { code: "ETM", name: "Ramon Airport", city: "Eilat", country: "Israel" },
  
  // Greece
  { code: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece" },
  { code: "SKG", name: "Thessaloniki Airport", city: "Thessaloniki", country: "Greece" },
  { code: "HER", name: "Heraklion Airport", city: "Heraklion", country: "Greece" },
  
  // Europe - Major Cities
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "FCO", name: "Fiumicino Airport", city: "Rome", country: "Italy" },
  { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain" },
  { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden" },
  { code: "OSL", name: "Oslo Airport", city: "Oslo", country: "Norway" },
  { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland" },
  { code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic" },
  { code: "BUD", name: "Budapest Ferenc Liszt Airport", city: "Budapest", country: "Hungary" },
  { code: "LIS", name: "Lisbon Portela Airport", city: "Lisbon", country: "Portugal" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  
  // USA
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA" },
  { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA" },
  { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "USA" },
  { code: "LAS", name: "Las Vegas McCarran International Airport", city: "Las Vegas", country: "USA" },
  { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "USA" },
  { code: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "USA" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta Airport", city: "Atlanta", country: "USA" },
  { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "USA" },
  
  // Asia
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Airport", city: "Mumbai", country: "India" },
  { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China" },
  { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China" },
  
  // Australia & New Zealand
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  
  // Middle East
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt" },
  { code: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "UAE" },
  
  // South America
  { code: "GRU", name: "São Paulo/Guarulhos Airport", city: "São Paulo", country: "Brazil" },
  { code: "EZE", name: "Ministro Pistarini Airport", city: "Buenos Aires", country: "Argentina" },
  { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru" },
  
  // Canada
  { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { code: "YUL", name: "Montréal-Pierre Elliott Trudeau Airport", city: "Montreal", country: "Canada" },
  
  // Africa
  { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa" },
  { code: "ADD", name: "Addis Ababa Bole Airport", city: "Addis Ababa", country: "Ethiopia" },
];
