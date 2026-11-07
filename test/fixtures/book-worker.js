// Processo separato che prova a prenotare uno slot sul file di calendario condiviso.
// Uso: node book-worker.js <file> <startIso> <name>
import { CalendarService } from '../../src/calendar/calendar.js';
import { FileStorage } from '../../src/calendar/storage.js';
import { NOW_ISO } from '../helpers.js';

const [file, start, name] = process.argv.slice(2);
const calendar = new CalendarService({ storage: new FileStorage(file), now: () => new Date(NOW_ISO) });
const res = await calendar.book({ start, name, vehicle: 'VW Golf', reason: 'Service', channel: 'worker' });
process.stdout.write(JSON.stringify(res));
