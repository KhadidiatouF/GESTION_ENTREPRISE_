import z from "zod";
import "dotenv/config";

export const dotenvSchema = z.object({
    NODE_ENV: z.enum(["developpement", "production", "test"]).default("developpement"),
    PORT: z.string().transform(Number).default(4003),
    DATABASE_URL: z.string().min(5),
    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1)
})

export const config = dotenvSchema.parse(process.env)