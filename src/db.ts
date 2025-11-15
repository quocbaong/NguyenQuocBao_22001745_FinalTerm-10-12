import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    db = await SQLite.openDatabaseAsync('simple_contacts.db');
    
    console.log('✅ Database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export default db;

