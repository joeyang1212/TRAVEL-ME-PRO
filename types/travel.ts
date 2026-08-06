export type AiMode = "shopping" | "wine" | "translate" | "guide" | "receipt" | "photo";

export type Favorite = {
  id: string;
  title: string;
  note: string;
  createdAt: string;
};

export type CartItem = {
  id: string;
  name: string;
  category: string;
  qty: number;
  unitPriceNzd: number;
  unitWeightKg: number;
  bought: boolean;
};

export type PhotoTask = {
  key: string;
  done: boolean;
  favorite: boolean;
};

export type WeatherHour = {
  time: string;
  temperature: number;
  humidity: number;
  apparent: number;
  rainProbability: number;
  weatherCode: number;
};

export type WeatherDay = {
  date: string;
  code: number;
  max: number;
  min: number;
  rainProbability: number;
  sunrise: string;
  sunset: string;
};

export type JournalEntry = {
  id: string;
  day: number;
  date: string;
  mood: string;
  note: string;
  spendTwd: number;
  photos: number;
};

export type ItineraryDay = {
  title: string;
  city: string;
  lat: number;
  lng: number;
};

export type Product = {
  name: string;
  category: string;
  nzdMin: number;
  nzdMax: number;
  twdRef: number;
  weight: number;
  stars: number;
  note: string;
  days: number[];
};

export type Wine = {
  name: string;
  region: string;
  style: string;
  nzdMin: number;
  nzdMax: number;
  gift: string;
  note: string;
};

export type HistoryGuide = {
  day: number;
  place: string;
  era: string;
  intro: string;
  formation: string;
  history: string[];
  lookFor: string[];
  quickFacts: string[];
};

export type PhotoSpot = {
  day: number;
  place: string;
  title: string;
  image: string;
  source: string;
  lat: number;
  lng: number;
  lens: string;
  photographer: string;
  subject: string;
  light: string;
  duration: string;
  pose: string;
  steps: string[];
  popularity: number;
  styles: string[];
  hashtags: string[];
  reasons: string[];
  diagram: string;
};
