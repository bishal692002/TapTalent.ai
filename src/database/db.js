import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'quotes.db');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source TEXT NOT NULL,
          buy_price REAL NOT NULL,
          sell_price REAL NOT NULL,
          currency TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON quotes(timestamp)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

export function saveQuote(quote, currency) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO quotes (source, buy_price, sell_price, currency) VALUES (?, ?, ?, ?)',
      [quote.source, quote.buy_price, quote.sell_price, currency],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function getRecentQuotes(currency, limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM quotes WHERE currency = ? ORDER BY timestamp DESC LIMIT ?',
      [currency, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

export default db;
