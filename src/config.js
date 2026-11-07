import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root,
  port: Number(process.env.PORT ?? 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  calendarFile: process.env.CALENDAR_FILE ?? path.join(root, 'data', 'calendar.json'),
  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'fr',
};
