import { useMyApartment } from "@/hooks/query/useApartments";
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
import { SafeAreaView } from "react-native-safe-area-context";

// Bảng màu hiện đại (Modern Indigo Theme)
const Colors = {
  primary: "#4F46E5", // Indigo
  primaryLight: "#EEF2FF",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  inputBg: "#F3F4F6",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
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
    ...props
  }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputContainer, multiline && styles.textAreaContainer]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={Colors.textMuted}
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
          {...props}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          enabled={true}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleClose}
              hitSlop={15}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.text}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Tạo Yêu Cầu</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.content}
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
                    pressed && { backgroundColor: Colors.border },
                  ]}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.uploadIconCircle}>
                    <MaterialCommunityIcons
                      name="camera"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.uploadText}>Chụp ảnh</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { backgroundColor: Colors.border },
                  ]}
                  onPress={handlePickImage}
                >
                  <View style={styles.uploadIconCircle}>
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={24}
                      color={Colors.primary}
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
                        color={Colors.surface}
                      />
                      <View style={styles.removeIconBg} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitBtnPressed,
              ]}
              onPress={handleSubmit}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={Colors.surface}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitBtnText}>Gửi Yêu Cầu</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Bê nguyên Stylesheet cũ xuống dưới (không có gì thay đổi)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 14,
  },
  textAreaContainer: {
    alignItems: "flex-start",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 110,
    paddingTop: 14,
  },
  imageScroll: {
    flexDirection: "row",
    paddingTop: 4,
    paddingBottom: 8,
  },
  uploadButton: {
    width: 90,
    height: 90,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.primary,
  },
  imagePreviewContainer: {
    marginRight: 12,
    position: "relative",
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 16,
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
    backgroundColor: Colors.error,
    borderRadius: 10,
    zIndex: -1,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 24,
    backgroundColor: Colors.background,
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
