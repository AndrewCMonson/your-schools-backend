declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: string;
      MONGO_URI: string;
      JWT_SECRET: string;
      JWT_EXPIRIRATION: string;
      VITE_GOOGLE_MAPS_API_KEY: string;
      VITE_GOOGLE_MAPS_ID: string;
    }
  }
}

export {};
