
export const CONFIG = {
  API_KEY: process.env.API_KEY || "",
  GCP_PROJECT_ID: "climate-smart-agriculture",
  REGION: "us-central1",
  FIRESTORE: {
    COLLECTIONS: {
      USERS: "users",
      CROPS: "crops",
      ADVISORIES: "advisories",
      MARKET: "market_prices",
      WEATHER: "weather_data",
      COMMUNITY: "community_posts"
    }
  },
  STORAGE_BUCKETS: {
    UPLOADS: "agri-smart-uploads",
    VOICE: "agri-smart-voice"
  }
};
