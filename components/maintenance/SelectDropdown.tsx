import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Colors = {
  primary: "#4F46E5",
  surface: "#FFFFFF",
  background: "#F9FAFB",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
};

interface SelectDropdownProps {
  label: string;
  icon?: string;
  placeholder: string;
  value: string;
  onSelect: (value: string) => void;
  options: { value: string; label: string }[];
  renderOption?: (option: any) => string;
  searchable?: boolean;
  dropdownStyle?: StyleProp<ViewStyle>;
}

export default function SelectDropdown({
  label,
  icon,
  placeholder,
  value,
  onSelect,
  options,
  renderOption,
  searchable = true,
  dropdownStyle,
}: SelectDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [value, options],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchText.trim()) return options;

    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, options, searchable]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setSearchText("");
    setModalVisible(false);
  };

  return (
    <>
      {/* Dropdown Trigger */}
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.trigger,
            pressed && styles.triggerPressed,
            !selectedOption && styles.triggerEmpty,
          ]}
          onPress={() => setModalVisible(true)}
        >
          {icon && (
            <MaterialCommunityIcons
              size={22}
              color={selectedOption ? Colors.primary : Colors.textMuted}
              style={styles.triggerIcon}
            />
          )}
          <Text
            style={[
              styles.triggerText,
              !selectedOption && styles.triggerPlaceholder,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <MaterialCommunityIcons
            name={modalVisible ? "chevron-up" : "chevron-down"}
            size={22}
            color={Colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Modal Dropdown */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setSearchText("");
          setModalVisible(false);
        }}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setSearchText("");
            setModalVisible(false);
          }}
        >
          <View
            style={[
              styles.modalContainer,
              !searchable && styles.modalContainerNoSearch,
              dropdownStyle,
            ]}
          >
            {/* Search Input - chỉ hiển thị khi searchable = true */}
            {searchable && (
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={Colors.textMuted}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                />
              </View>
            )}

            {/* Options List */}
            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                scrollEnabled={filteredOptions.length > 6}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionItem,
                      pressed && styles.optionItemPressed,
                      item.value === value && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <MaterialCommunityIcons
                        name="check"
                        size={22}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="checkbox-blank-outline"
                  size={40}
                  color={Colors.textMuted}
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  triggerPressed: {
    backgroundColor: "#F3F4F6",
    borderColor: Colors.primary,
  },
  triggerEmpty: {
    borderColor: Colors.border,
  },
  triggerIcon: {
    marginRight: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  triggerPlaceholder: {
    color: Colors.textMuted,
    fontWeight: "400",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: 100,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalContainerNoSearch: {
    paddingTop: 8,
    maxHeight: "85%",
    minHeight: 280,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  optionItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  optionItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});
