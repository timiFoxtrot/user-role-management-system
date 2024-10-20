export default async () => ({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_DOCUMENTATION: process.env.ENABLE_DOCUMENTATION,
    APP_URL: process.env.APP_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    ENGINE: process.env.AUTH_ENGINE || 'JWT',
  });