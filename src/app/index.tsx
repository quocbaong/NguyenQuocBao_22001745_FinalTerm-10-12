import React, { useState, useCallback, useEffect } from "react";
import { Text, View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Contact } from "../db";
import { useContacts } from "../hooks/useContacts";

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

  const { editContact } = useContacts();

  const handleSave = async () => {
    if (!validate() || !contact) {
      return;
    }

    try {
      await editContact(
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
  const { addContact } = useContacts();
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
      await addContact(name.trim(), phone.trim() || null, email.trim() || null);
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
  // ✅ Sử dụng custom hook useContacts
  const {
    contacts,
    loading,
    importing,
    searchText,
    setSearchText,
    showFavoriteOnly,
    setShowFavoriteOnly,
    loadContacts,
    toggleFavorite,
    importFromAPI,
    removeContact,
  } = useContacts();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { top } = useSafeAreaInsets();

  // ✅ Mở modal sửa contact
  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setEditModalVisible(true);
  }, []);

  // ✅ Xóa contact với xác nhận
  const handleDeleteContact = useCallback(
    (contact: Contact) => {
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
                await removeContact(contact.id);
              } catch (error) {
                console.error('Error deleting contact:', error);
                Alert.alert('Lỗi', 'Không thể xóa liên hệ. Vui lòng thử lại.');
              }
            },
          },
        ]
      );
    },
    [removeContact]
  );

  // ✅ Toggle favorite với error handling
  const handleToggleFavorite = useCallback(
    async (contact: Contact) => {
      try {
        await toggleFavorite(contact);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể cập nhật yêu thích. Vui lòng thử lại.');
      }
    },
    [toggleFavorite]
  );

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
          onPress={importFromAPI}
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
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.contactItem,
                // ✅ Highlight các contact favorite (màu khác)
                item.favorite === 1 && styles.contactItemFavorite,
              ]}
              onLongPress={() => handleEditContact(item)}
              activeOpacity={0.7}
            >
              <View style={styles.contactHeader}>
                <View style={styles.contactNameContainer}>
                  {/* ✅ Icon favorite nếu favorite = 1 */}
                  {item.favorite === 1 && (
                    <Text style={styles.favoriteBadge}>⭐</Text>
                  )}
                  <Text
                    style={[
                      styles.contactName,
                      item.favorite === 1 && styles.contactNameFavorite,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📇</Text>
              <Text style={styles.emptyTitle}>
                {searchText || showFavoriteOnly
                  ? 'Không tìm thấy liên hệ nào'
                  : 'Chưa có liên hệ nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText || showFavoriteOnly
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc tắt bộ lọc'
                  : 'Nhấn nút "+" để thêm liên hệ mới'}
              </Text>
            </View>
          }
          contentContainerStyle={contacts.length === 0 ? styles.emptyList : styles.list}
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
  // ✅ Highlight các contact favorite (màu khác)
  contactItemFavorite: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  favoriteBadge: {
    fontSize: 16,
    marginRight: 6,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  // ✅ Highlight tên contact favorite
  contactNameFavorite: {
    color: '#92400E',
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
  // ✅ Empty state dễ nhìn, thân thiện
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
