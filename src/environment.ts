import { z } from 'zod';

export const EnvironmentSchema = z.object({
  HEURIST_API_KEY: z.string().min(1, 'HEURIST_API_KEY is required')
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const validateEnvironment = (runtime: any): Environment => {
  const apiKey = runtime.getSetting('HEURIST_API_KEY');
  
  try {
    return EnvironmentSchema.parse({
      HEURIST_API_KEY: apiKey
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Environment validation failed: ${error.message}`);
    }
    throw new Error('Environment validation failed: Unknown error');
  }
}; 