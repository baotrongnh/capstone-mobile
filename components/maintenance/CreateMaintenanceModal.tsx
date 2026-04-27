import { useMyApartment } from "@/hooks/query/useApartments";
import { Colors } from "@/components/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useMemo } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SelectDropdown from "./SelectDropdown";
import { useCreateMaintenanceRequest } from "@/hooks/query/useMaintenance";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ModalColors = {
  primary: Colors.primary,
  primaryLight: "#dbeafe",
  surface: "#ffffff",
  inputBg: "#f8fafc",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  error: "#ef4444",
};

// Danh sách categories
const CATEGORIES_OPTIONS = [
  { value: "plumbing", label: "Nước" },
  { value: "hvac", label: "Điều hòa" },
  { value: "electrical", label: "Điện" },
  { value: "appliance", label: "Thiết bị" },
  { value: "pest_control", label: "Phòng trừ sâu" },
  { value: "structural", label: "Cấu trúc" },
  { value: "other", label: "Khác" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "emergency", label: "Khẩn cấp" },
];

interface CreateMaintenanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface FormInputProps {
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}

// Giá trị mặc định của form để dễ dàng reset
const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  apartmentId: "",
  roomId: "",
  category: "",
  priority: "",
  images: [] as string[],
};

export default function ModalCreateMaintenance({
  visible,
  onClose,
  onSubmit,
}: CreateMaintenanceModalProps) {
  const insets = useSafeAreaInsets();

  // 1. Gom tất cả data vào 1 state form duy nhất
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const { data: myApartment } = useMyApartment();

  const { mutateAsync: createMaintenanceRequest } =
    useCreateMaintenanceRequest();

  // Build apartment options from API data
  const apartmentOptions = useMemo(() => {
    // API returns { statusCode, message, data: Array, meta }
    const apartments = myApartment?.data;
    if (!Array.isArray(apartments) || apartments.length === 0) return [];

    // Dùng Map để lọc trùng lặp theo số căn hộ (label)
    const uniqueApartmentsMap = new Map();

    apartments.forEach((item: any) => {
      const label = item.apartment?.apartmentNumber
        ? `${item.apartment.apartmentNumber}`
        : "Không xác định";

      // Nếu label (ví dụ: "S-999") chưa tồn tại trong Map thì mới thêm vào
      if (!uniqueApartmentsMap.has(label)) {
        uniqueApartmentsMap.set(label, {
          value: item.apartmentId,
          label: label,
          fullData: item,
        });
      }
    });

    // Chuyển Map values thành mảng để đưa vào options
    return Array.from(uniqueApartmentsMap.values());
  }, [myApartment]);

  // Hàm update field chung cho toàn bộ form
  const handleFormChange = (
    field: keyof typeof INITIAL_FORM_STATE,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate dùng data từ form
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Vui lòng nhập đủ tiêu đề và mô tả");
      return;
    }

    if (!formData.apartmentId) {
      alert("Vui lòng chọn căn hộ");
      return;
    }

    if (!formData.category) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      apartmentId: formData.apartmentId,
      category: formData.category,
      ...(formData.priority && { priority: formData.priority }),
      ...(formData.roomId && { roomId: formData.roomId }),
      ...(formData.images.length > 0 && { images: formData.images }),
    };

    console.log("FORM", submitData);

    try {
      await createMaintenanceRequest(submitData);
      onSubmit(submitData);
      alert("Tạo yêu cầu thành công!");
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      alert("Lỗi khi tạo yêu cầu. Vui lòng thử lại.");
    }

    resetForm();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        handleFormChange("images", [...formData.images, ...selectedImages]);
      }
    } catch {
      alert("Lỗi khi chọn ảnh");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const cameraImages = result.assets.map((asset) => asset.uri);
        handleFormChange("images", [...formData.images, ...cameraImages]);
      }
    } catch {
      alert("Lỗi khi chụp ảnh");
    }
  };

  const removeImage = (index: number) => {
    handleFormChange(
      "images",
      formData.images.filter((_, i) => i !== index),
    );
  };

  const resetForm = () => {
    // Reset form chỉ cần set lại về state ban đầu
    setFormData(INITIAL_FORM_STATE);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const FormInput = ({
    label,
    icon,
    placeholder,
    value,
    onChangeText,
    multiline = false,
  }: FormInputProps) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputContainer, multiline && styles.textAreaContainer]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={ModalColors.textMuted}
            style={[styles.inputIcon, multiline && { marginTop: 14 }]}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        style={styles.overlay}
      >
        <Pressable style={styles.overlayBg} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tạo yêu cầu bảo trì</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={ModalColors.textMuted}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <FormInput
              label="Tiêu đề"
              icon="subtitles-outline"
              placeholder="VD: Điều hòa không lạnh..."
              value={formData.title}
              onChangeText={(text: string) => handleFormChange("title", text)}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <SelectDropdown
                  label="Mã căn hộ"
                  icon="office-building-outline"
                  placeholder="Chọn mã căn hộ"
                  value={formData.apartmentId}
                  onSelect={(val: string) =>
                    handleFormChange("apartmentId", val)
                  }
                  options={apartmentOptions}
                  searchable={false}
                  dropdownStyle={{ marginTop: -30 }}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <SelectDropdown
                  label="Loại"
                  icon="shape-outline"
                  placeholder="Chọn loại"
                  value={formData.category}
                  onSelect={(val: string) => handleFormChange("category", val)}
                  options={CATEGORIES_OPTIONS}
                  renderOption={(option: any) => option.label}
                  searchable={false}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <SelectDropdown
                  label="Ưu tiên"
                  icon="shape-outline"
                  placeholder="Chọn ưu tiên"
                  value={formData.priority}
                  onSelect={(val: string) => handleFormChange("priority", val)}
                  options={PRIORITY_OPTIONS}
                  renderOption={(option: any) => option.label}
                  searchable={false}
                />
              </View>
            </View>

            <FormInput
              label="Mô tả chi tiết vấn đề"
              icon="text-box-outline"
              placeholder="Miêu tả rõ tình trạng bạn đang gặp phải..."
              value={formData.description}
              onChangeText={(text: string) =>
                handleFormChange("description", text)
              }
              multiline={true}
            />

            {/* Images Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hình ảnh đính kèm</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { backgroundColor: ModalColors.border },
                  ]}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.uploadIconCircle}>
                    <MaterialCommunityIcons
                      name="camera"
                      size={24}
                      color={ModalColors.primary}
                    />
                  </View>
                  <Text style={styles.uploadText}>Chụp ảnh</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { backgroundColor: ModalColors.border },
                  ]}
                  onPress={handlePickImage}
                >
                  <View style={styles.uploadIconCircle}>
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={24}
                      color={ModalColors.primary}
                    />
                  </View>
                  <Text style={styles.uploadText}>Chọn ảnh</Text>
                </Pressable>

                {formData.images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <Pressable
                      style={styles.removeIcon}
                      onPress={() => removeImage(index)}
                      hitSlop={10}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={24}
                        color={ModalColors.surface}
                      />
                      <View style={styles.removeIconBg} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
              ]}
              onPress={handleSubmit}
            >
              <MaterialCommunityIcons
                name="send"
                size={18}
                color={ModalColors.surface}
              />
              <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    backgroundColor: ModalColors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ModalColors.text,
  },
  content: {
    maxHeight: "72%",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ModalColors.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ModalColors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ModalColors.border,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 110,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: ModalColors.text,
  },
  textArea: {
    height: 98,
    paddingTop: 10,
  },
  imageScroll: {
    flexDirection: "row",
    paddingTop: 2,
    paddingBottom: 8,
  },
  uploadButton: {
    width: 104,
    height: 88,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ModalColors.surface,
    marginRight: 12,
  },
  uploadIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ModalColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: ModalColors.primary,
  },
  imagePreviewContainer: {
    marginRight: 12,
    position: "relative",
  },
  imagePreview: {
    width: 104,
    height: 88,
    borderRadius: 12,
  },
  removeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 2,
  },
  removeIconBg: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    backgroundColor: ModalColors.error,
    borderRadius: 10,
    zIndex: -1,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: ModalColors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: ModalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnPressed: {
    opacity: 0.92,
  },
  submitBtnText: {
    color: ModalColors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
});
