import * as Joi from 'joi';

export default () => ({
  port: parseInt(process.env.PORT ?? '5013', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  runMigrations: process.env.RUN_MIGRATIONS === 'true',
  cors: { origins: (process.env.CORS_ORIGINS ?? '').split(',').map(o => o.trim()).filter(Boolean) },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
});

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(5013),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  CORS_ORIGINS: Joi.string().allow('').optional(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  RUN_MIGRATIONS: Joi.boolean().truthy('true').falsy('false').default(false),
});
