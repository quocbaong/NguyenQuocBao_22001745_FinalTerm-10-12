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
  // Nếu database đã được khởi tạo, trả về ngay
  if (db) {
    return db;
  }
  
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

export const insertContact = async (
  name: string,
  phone?: string | null,
  email?: string | null
): Promise<number> => {
  try {
    const database = getDatabase();
    const now = Date.now();
    
    const statement = await database.prepareAsync(
      'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, 0, ?)'
    );
    
    try {
      const result = await statement.executeAsync([name, phone || null, email || null, now]);
      return result.lastInsertRowId;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error inserting contact:', error);
    throw error;
  }
};

// Cập nhật favorite của contact (toggle 0 ↔ 1)
export const updateContactFavorite = async (id: number, favorite: number): Promise<void> => {
  try {
    const database = getDatabase();
    const statement = await database.prepareAsync(
      'UPDATE contacts SET favorite = ? WHERE id = ?'
    );
    
    try {
      await statement.executeAsync([favorite, id]);
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error updating contact favorite:', error);
    throw error;
  }
};

// Cập nhật thông tin contact (name, phone, email)
export const updateContact = async (
  id: number,
  name: string,
  phone?: string | null,
  email?: string | null
): Promise<void> => {
  try {
    const database = getDatabase();
    const statement = await database.prepareAsync(
      'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?'
    );
    
    try {
      await statement.executeAsync([name, phone || null, email || null, id]);
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

// Xóa contact khỏi database
export const deleteContact = async (id: number): Promise<void> => {
  try {
    const database = getDatabase();
    const statement = await database.prepareAsync(
      'DELETE FROM contacts WHERE id = ?'
    );
    
    try {
      await statement.executeAsync([id]);
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export default db;

