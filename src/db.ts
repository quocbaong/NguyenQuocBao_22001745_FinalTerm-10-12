import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const seedSampleData = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts'
    );
    
    if (result && result.count === 0) {
      const now = Date.now();
      
      await database.execAsync(`
        INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES
        ('Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', 1, ${now}),
        ('Trần Thị B', '0912345678', 'tranthib@email.com', 0, ${now - 3600000}),
        ('Lê Văn C', '0923456789', NULL, 1, ${now - 7200000});
      `);
      
      console.log('✅ Sample contacts seeded successfully');
    } else {
      console.log('📋 Database already has contacts, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    db = await SQLite.openDatabaseAsync('simple_contacts.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        favorite INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);
    
    await seedSampleData(db);
    
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

// Interface cho Contact
export interface Contact {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  favorite: number;
  created_at: number | null;
}

// Lấy tất cả contacts từ database
export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    const database = getDatabase();
    const result = await database.getAllAsync<Contact>(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export default db;

