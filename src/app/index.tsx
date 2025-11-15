import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Text, View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllContacts, insertContact, updateContact, updateContactFavorite, deleteContact, initDatabase, Contact } from "../db";

// Modal component để chỉnh sửa contact
const EditContactModal = ({ 
  visible, 
  onClose, 
  onSuccess,
  contact
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  contact: Contact | null;
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Điền dữ liệu contact khi modal mở
  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
    }
  }, [contact]);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    
    // ✅ Validate: name không rỗng
    if (!name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }
    
    // ✅ Validate: email có chứa ký tự @ nếu không rỗng
    if (email.trim() && !email.includes('@')) {
      newErrors.email = 'Email phải chứa ký tự @';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !contact) {
      return;
    }

    try {
      // Đảm bảo database đã được khởi tạo
      await initDatabase();
      // ✅ UPDATE vào SQLite
      await updateContact(
        contact.id,
        name.trim(),
        phone.trim() || null,
        email.trim() || null
      );
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setErrors({});
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật liên hệ. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setErrors({});
    onClose();
  };

  if (!contact) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sửa liên hệ</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Nhập tên"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại (tùy chọn)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Nhập email (tùy chọn)"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal component để thêm contact mới
const AddContactModal = ({ 
  visible, 
  onClose, 
  onSuccess 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    
    // ✅ Validate: name không rỗng
    if (!name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }
    
    // ✅ Validate: email có chứa ký tự @ nếu không rỗng
    if (email.trim() && !email.includes('@')) {
      newErrors.email = 'Email phải chứa ký tự @';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Đảm bảo database đã được khởi tạo
      await initDatabase();
      await insertContact(name.trim(), phone.trim() || null, email.trim() || null);
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setErrors({});
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Lỗi', 'Không thể lưu liên hệ. Vui lòng thử lại.');
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm liên hệ mới</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Nhập tên"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại (tùy chọn)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Nhập email (tùy chọn)"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function Page() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  // ✅ State cho tìm kiếm và filter
  const [searchText, setSearchText] = useState('');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  // ✅ State cho import API
  const [importing, setImporting] = useState(false);
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setLoading(true);
        // Đảm bảo database đã được khởi tạo trước khi load contacts
        await initDatabase();
        await loadContacts();
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAndLoad();
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, []);

  // ✅ Tối ưu bằng useMemo để filter contacts theo searchText và favorite
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // ✅ Filter chỉ hiển thị các contact favorite (nếu bật)
    if (showFavoriteOnly) {
      result = result.filter(contact => contact.favorite === 1);
    }

    // ✅ Tìm kiếm theo name hoặc phone
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter(contact => {
        const nameMatch = contact.name.toLowerCase().includes(searchLower);
        const phoneMatch = contact.phone?.toLowerCase().includes(searchLower) || false;
        return nameMatch || phoneMatch;
      });
    }

    return result;
  }, [contacts, searchText, showFavoriteOnly]);

  // ✅ Tối ưu bằng useCallback
  const handleToggleFavorite = useCallback(async (contact: Contact) => {
    try {
      // Đảm bảo database đã được khởi tạo
      await initDatabase();
      const newFavorite = contact.favorite === 1 ? 0 : 1;
      await updateContactFavorite(contact.id, newFavorite);
      await loadContacts();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  }, [loadContacts]);

  // ✅ Mở modal sửa contact
  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setEditModalVisible(true);
  }, []);

  // ✅ Import contacts từ API
  const handleImportFromAPI = useCallback(async () => {
    try {
      setImporting(true);
      
      // Đảm bảo database đã được khởi tạo trước khi làm bất cứ gì
      await initDatabase();
      
      // ✅ Gọi GET tới endpoint danh sách contact mẫu
      const response = await fetch('https://691845db21a96359486f8565.mockapi.io/contacts');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiContacts = await response.json();
      
      // Đảm bảo database vẫn còn kết nối trước khi query
      await initDatabase();
      
      // Lấy danh sách contacts hiện có để kiểm tra trùng lặp
      const existingContacts = await getAllContacts();
      const existingPhones = new Set(
        existingContacts
          .map(c => c.phone)
          .filter(phone => phone !== null && phone !== '')
      );
      
      let importedCount = 0;
      let skippedCount = 0;
      
      // ✅ Map dữ liệu và kiểm tra trùng lặp
      for (const apiContact of apiContacts) {
        // ✅ Map dữ liệu: name → name, phone → phone, email → email
        const name = apiContact.name || '';
        const phone = apiContact.phone || null;
        const email = apiContact.email || null;
        
        // ✅ Nếu phone trùng với một contact đã có → bỏ qua
        if (phone && existingPhones.has(phone)) {
          skippedCount++;
          continue;
        }
        
        // Đảm bảo database vẫn còn kết nối trước khi insert
        await initDatabase();
        
        // Insert contact mới vào SQLite
        await insertContact(name, phone, email);
        importedCount++;
        
        // Thêm phone vào set để tránh trùng trong cùng một lần import
        if (phone) {
          existingPhones.add(phone);
        }
      }
      
      // Đảm bảo database vẫn còn kết nối trước khi refresh
      await initDatabase();
      
      // Refresh danh sách sau khi import
      await loadContacts();
      
      // Hiển thị thông báo kết quả
      Alert.alert(
        'Import thành công',
        `Đã import ${importedCount} liên hệ.\n${skippedCount > 0 ? `Bỏ qua ${skippedCount} liên hệ trùng lặp.` : ''}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error importing contacts:', error);
      // ✅ Error state
      Alert.alert(
        'Lỗi import',
        'Không thể import liên hệ từ API. Vui lòng kiểm tra kết nối và thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setImporting(false);
    }
  }, [loadContacts]);

  // ✅ Xóa contact với xác nhận
  const handleDeleteContact = useCallback((contact: Contact) => {
    // ✅ Hiện Alert xác nhận trước khi xóa
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa liên hệ "${contact.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Đảm bảo database đã được khởi tạo
              await initDatabase();
              // ✅ DELETE khỏi SQLite nếu người dùng đồng ý
              await deleteContact(contact.id);
              // Refresh danh sách sau khi xóa
              await loadContacts();
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Lỗi', 'Không thể xóa liên hệ. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [loadContacts]);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simple Contacts</Text>
        {/* ✅ Nút "+" mở Modal thêm contact */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ TextInput Search để tìm kiếm theo name hoặc phone */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        {/* ✅ Filter chỉ hiển thị các contact favorite (tùy chọn) */}
        <TouchableOpacity
          style={[styles.filterButton, showFavoriteOnly && styles.filterButtonActive]}
          onPress={() => setShowFavoriteOnly(!showFavoriteOnly)}
        >
          <Text style={[styles.filterButtonText, showFavoriteOnly && styles.filterButtonTextActive]}>
            ⭐
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Nút "Import từ API" */}
      <View style={styles.importContainer}>
        <TouchableOpacity
          style={[styles.importButton, importing && styles.importButtonDisabled]}
          onPress={handleImportFromAPI}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.importButtonText}>
            {importing ? 'Đang import...' : 'Import từ API'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onLongPress={() => handleEditContact(item)}
              activeOpacity={0.7}
            >
              <View style={styles.contactHeader}>
                <Text style={styles.contactName}>{item.name}</Text>
                {/* ✅ Icon sao để toggle favorite (0 ↔ 1) */}
                <TouchableOpacity 
                  onPress={() => handleToggleFavorite(item)}
                  style={styles.favoriteButton}
                >
                  <Text style={styles.favoriteIcon}>
                    {item.favorite === 1 ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
              {item.phone && (
                <Text style={styles.contactPhone}>{item.phone}</Text>
              )}
              {item.email && (
                <Text style={styles.contactEmail}>{item.email}</Text>
              )}
              {/* ✅ Nút "Sửa" và "Xóa" */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditContact(item)}
                >
                  <Text style={styles.editButtonText}>Sửa</Text>
                </TouchableOpacity>
                {/* ✅ Nút xóa để xóa contact */}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContact(item)}
                >
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchText || showFavoriteOnly 
                  ? 'Không tìm thấy liên hệ nào.' 
                  : 'Chưa có liên hệ nào.'}
              </Text>
            </View>
          }
          contentContainerStyle={filteredContacts.length === 0 ? styles.emptyList : styles.list}
        />
      )}

      {/* ✅ Modal thêm contact */}
      <AddContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={loadContacts}
      />

      {/* ✅ Modal sửa contact */}
      <EditContactModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedContact(null);
        }}
        onSuccess={loadContacts}
        contact={selectedContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  filterButtonText: {
    fontSize: 20,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  importContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  importButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 32,
    color: '#FBBF24',
  },
  contactPhone: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
