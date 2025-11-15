import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getAllContacts,
  insertContact,
  updateContact,
  updateContactFavorite,
  deleteContact,
  initDatabase,
  Contact,
} from '../db';

const API_URL = 'https://691845db21a96359486f8565.mockapi.io/contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [importing, setImporting] = useState(false);

  // ✅ Load contacts
  const loadContacts = useCallback(async () => {
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, []);

  // ✅ Insert contact
  const addContact = useCallback(
    async (name: string, phone?: string | null, email?: string | null) => {
      try {
        await initDatabase();
        await insertContact(name, phone, email);
        await loadContacts();
      } catch (error) {
        console.error('Error adding contact:', error);
        throw error;
      }
    },
    [loadContacts]
  );

  // ✅ Update contact
  const editContact = useCallback(
    async (id: number, name: string, phone?: string | null, email?: string | null) => {
      try {
        await initDatabase();
        await updateContact(id, name, phone, email);
        await loadContacts();
      } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
      }
    },
    [loadContacts]
  );

  // ✅ Delete contact
  const removeContact = useCallback(
    async (id: number) => {
      try {
        await initDatabase();
        await deleteContact(id);
        await loadContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
    },
    [loadContacts]
  );

  // ✅ Toggle favorite
  const toggleFavorite = useCallback(
    async (contact: Contact) => {
      try {
        await initDatabase();
        const newFavorite = contact.favorite === 1 ? 0 : 1;
        await updateContactFavorite(contact.id, newFavorite);
        await loadContacts();
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    },
    [loadContacts]
  );

  // ✅ Import from API
  const importFromAPI = useCallback(async () => {
    try {
      setImporting(true);
      await initDatabase();

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiContacts = await response.json();
      await initDatabase();

      const existingContacts = await getAllContacts();
      const existingPhones = new Set(
        existingContacts
          .map((c) => c.phone)
          .filter((phone) => phone !== null && phone !== '')
      );

      let importedCount = 0;
      let skippedCount = 0;

      for (const apiContact of apiContacts) {
        const name = apiContact.name || '';
        const phone = apiContact.phone || null;
        const email = apiContact.email || null;

        if (phone && existingPhones.has(phone)) {
          skippedCount++;
          continue;
        }

        await initDatabase();
        await insertContact(name, phone, email);
        importedCount++;

        if (phone) {
          existingPhones.add(phone);
        }
      }

      await initDatabase();
      await loadContacts();

      Alert.alert(
        'Import thành công',
        `Đã import ${importedCount} liên hệ.\n${skippedCount > 0 ? `Bỏ qua ${skippedCount} liên hệ trùng lặp.` : ''}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error importing contacts:', error);
      Alert.alert(
        'Lỗi import',
        'Không thể import liên hệ từ API. Vui lòng kiểm tra kết nối và thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setImporting(false);
    }
  }, [loadContacts]);

  // ✅ Filtered contacts với useMemo
  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (showFavoriteOnly) {
      result = result.filter((contact) => contact.favorite === 1);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter((contact) => {
        const nameMatch = contact.name.toLowerCase().includes(searchLower);
        const phoneMatch = contact.phone?.toLowerCase().includes(searchLower) || false;
        return nameMatch || phoneMatch;
      });
    }

    return result;
  }, [contacts, searchText, showFavoriteOnly]);

  // ✅ Initialize database và load contacts khi mount
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setLoading(true);
        await initDatabase();
        await loadContacts();
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, [loadContacts]);

  return {
    contacts: filteredContacts,
    loading,
    importing,
    searchText,
    setSearchText,
    showFavoriteOnly,
    setShowFavoriteOnly,
    loadContacts,
    addContact,
    editContact,
    removeContact,
    toggleFavorite,
    importFromAPI,
  };
};

