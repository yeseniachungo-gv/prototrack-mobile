import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-related-resources.ts';
import '@/ai/flows/generate-daily-report.ts';
import '@/ai/flows/generate-consolidated-report.ts';
import '@/ai/flows/generate-weekly-report.ts';
import '@/ai/flows/generate-monthly-report.ts';
