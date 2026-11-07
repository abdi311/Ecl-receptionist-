// Archivi per il calendario finto.
// - MemoryStorage: in memoria (test).
// - FileStorage: file JSON condiviso tra processi (server web + chat telefonica),
//   protetto da un lock su file, così due processi non possono prenotare lo stesso slot.

import fs from 'node:fs';
import path from 'node:path';
import { TZ } from '../time.js';

const emptyCalendar = () => ({ timezone: TZ, bookings: [] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Mutex in-process: esegue le funzioni una alla volta, in ordine. */
export function createMutex() {
  let tail = Promise.resolve();
  return (fn) => {
    const result = tail.then(() => fn());
    tail = result.catch(() => {});
    return result;
  };
}

export class MemoryStorage {
  constructor(initial) {
    this.data = initial ? structuredClone(initial) : emptyCalendar();
    this.withLock = createMutex();
  }
  async read() {
    return structuredClone(this.data);
  }
  async write(data) {
    // Pausa artificiale: rende evidente una race condition se il lock mancasse.
    await sleep(1);
    this.data = structuredClone(data);
  }
}

export class FileStorage {
  constructor(filePath, { lockTimeoutMs = 5000, staleLockMs = 10000 } = {}) {
    this.filePath = path.resolve(filePath);
    this.lockPath = this.filePath + '.lock';
    this.lockTimeoutMs = lockTimeoutMs;
    this.staleLockMs = staleLockMs;
    const mutex = createMutex();
    this.withLock = (fn) => mutex(() => this.#withFileLock(fn));
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
  }

  async read() {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') return emptyCalendar();
      throw e;
    }
  }

  async write(data) {
    await sleep(1);
    const tmp = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, this.filePath); // scrittura atomica
  }

  async #withFileLock(fn) {
    const deadline = Date.now() + this.lockTimeoutMs;
    for (;;) {
      try {
        fs.mkdirSync(this.lockPath); // operazione atomica: riesce a un solo processo
        break;
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;
        try {
          const st = fs.statSync(this.lockPath);
          if (Date.now() - st.mtimeMs > this.staleLockMs) {
            fs.rmSync(this.lockPath, { recursive: true, force: true });
            continue;
          }
        } catch {
          continue;
        }
        if (Date.now() > deadline) throw new Error('calendar_lock_timeout');
        await sleep(5 + Math.random() * 15);
      }
    }
    try {
      return await fn();
    } finally {
      fs.rmSync(this.lockPath, { recursive: true, force: true });
    }
  }
}
