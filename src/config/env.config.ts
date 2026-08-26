import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();
const envSchema= z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000' as unknown as number),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  MONGO_URI: z.string().min(1, 'MongoDB URI is required'),
  DB_NAME: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.string().default('info'),
});

const parseEnv=()=>{
    const result = envSchema.safeParse(process.env);
    if(!result.success){
        console.error('invalid environment variables',JSON.stringify(result.error.format(),null,2))
        process.exit(1);
    }
    return result.data;
};

export const env=parseEnv();