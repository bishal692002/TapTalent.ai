import { initDatabase } from './db.js';

console.log('Initializing database...');

initDatabase()
  .then(() => {
    console.log('Database initialized successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
