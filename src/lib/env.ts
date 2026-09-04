import { z } from "zod";

const ServerEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must contain at least 32 characters")
      .optional(),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url("NEXT_PUBLIC_APP_URL must be a valid URL")
      .default("http://localhost:3001"),
    SHIPMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
    DIGITAL_ASSET_BASE_URL: z.string().url("DIGITAL_ASSET_BASE_URL must be a valid URL").optional(),
    FULFILLMENT_CRON_SECRET: z.string().min(32).optional(),
    EMAIL_WEBHOOK_URL: z.string().url("EMAIL_WEBHOOK_URL must be a valid URL").optional(),
    MEDIA_STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
    MEDIA_STORAGE_BUCKET: z.string().min(1).optional(),
    MEDIA_STORAGE_REGION: z.string().min(1).default("us-east-1"),
    MEDIA_STORAGE_ENDPOINT: z.string().url().optional(),
    MEDIA_STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
    MEDIA_STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    MEDIA_STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
    MEDIA_LOCAL_DIR: z.string().min(1).default(".media"),
  })
  .superRefine((environment, context) => {
    if (environment.NODE_ENV !== "production") return;

    if (!environment.DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production",
      });
    }

    if (!environment.JWT_SECRET) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET is required in production",
      });
    }

    if (environment.MEDIA_STORAGE_PROVIDER === "s3") {
      for (const key of ["MEDIA_STORAGE_BUCKET", "MEDIA_STORAGE_ACCESS_KEY_ID", "MEDIA_STORAGE_SECRET_ACCESS_KEY"] as const) {
        if (!environment[key]) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} is required when MEDIA_STORAGE_PROVIDER is s3` });
        }
      }
    }
  });

export type ServerEnv = z.output<typeof ServerEnvSchema>;

export function parseServerEnv(environment: NodeJS.ProcessEnv): ServerEnv {
  const result = ServerEnvSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid server environment: ${details}`);
  }

  return result.data;
}

export const serverEnv = parseServerEnv(process.env);
