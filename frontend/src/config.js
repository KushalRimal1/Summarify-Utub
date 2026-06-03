const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:8000' : 'https://vidinsights-ai.onrender.com')
};

export default config;
