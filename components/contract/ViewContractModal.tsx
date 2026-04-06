import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import SignatureCanvas from "react-native-signature-canvas";
import { PDFDocument } from "pdf-lib";
import * as FileSystem from "expo-file-system/legacy";
import { ContractWithMembers } from "@/types/contract";
import { useUploadContractPdf } from "@/hooks/query/useContracts";
import * as base64js from "base64-js";
import { rgb } from "pdf-lib";
import { Link } from "expo-router";
interface ViewContractModalProps {
  visible: boolean;
  contract: ContractWithMembers | null;
  onClose: () => void;
  onDownload: () => void;
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.95,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    marginTop: 20,
  },
  content: {
    padding: 10,
  },
  alertBox: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1976d2",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    color: "#1565c0",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#efefef",
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pdfContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginVertical: 12,
    overflow: "hidden",
    height: 400,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pdfWebView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
  notificationBox: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 14,
    marginVertical: 12,
    flexDirection: "row",
    gap: 10,
  },
  notificationText: {
    flex: 1,
    fontSize: 12,
    color: "#1565c0",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2196f3",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  signaturePreviewSection: {
    marginVertical: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  signaturePreview: {
    width: "100%",
    height: 180,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: "#fff",
  },
  signatureModalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  signatureModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signatureHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  signatureHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  closeIconButton: {
    padding: 4,
  },
  signatureContent: {
    padding: 20,
  },
  instructionBox: {
    flexDirection: "row",
    backgroundColor: "#f0f7ff",
    padding: 16,
    borderRadius: 8,
    gap: 12,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  canvasContainer: {
    height: 250,
    borderWidth: 2,
    borderColor: "#2196f3",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  footerInstructionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  signatureActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  actionBtnOutlineText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  actionBtnPrimary: {
    backgroundColor: "#2196f3",
  },
  actionBtnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export const ViewContractModal = ({
  visible,
  contract,
  onClose,
  onDownload,
}: ViewContractModalProps) => {
  const signatureRef = useRef<any>(null);
  const { mutateAsync: uploadPdf, isPending } = useUploadContractPdf(
    contract?.id || "",
  );

  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  const [embeddedPdfUri, setEmbeddedPdfUri] = useState<string | null>(null);
  const [modifiedPdfBase64, setModifiedPdfBase64] = useState<string | null>(
    null,
  );

  console.log("AAA", contract);

  const getPdfUrl = () => {
    if (!contract?.pdfUrl) return "";
    return `${process.env.EXPO_PUBLIC_API_BASE_URL}${process.env.EXPO_PUBLIC_API_PREFIX}${contract.pdfUrl}`;
  };

  const getGoogleViewerUrl = () => {
    const pdfUrl = getPdfUrl();
    if (!pdfUrl) return "";
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
  };

  const handleSignatureCapture = async (signature: string) => {
    if (!signature || signature.length === 0) {
      Alert.alert("Lỗi", "Chữ ký không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setSignatureImage(signature);
    setShowSignatureModal(false);

    const originalPdfUrl = getPdfUrl();
    if (!originalPdfUrl) return;

    try {
      setPdfLoading(true);

      // 🔥 SỬA LẠI 1: Cắt chính xác tiền tố data URI bằng Regex cho an toàn
      const signatureBase64 = signature.replace(
        /^data:image\/(png|jpeg|jpg);base64,/,
        "",
      );

      const tempDownloadUri = FileSystem.cacheDirectory + "temp_contract.pdf";
      const downloadRes = await FileSystem.downloadAsync(
        originalPdfUrl,
        tempDownloadUri,
      );

      if (downloadRes.status !== 200) {
        Alert.alert("Lỗi", "Không thể tải file gốc từ server.");
        setPdfLoading(false);
        return;
      }

      const pdfBase64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const pdfBytes = base64js.toByteArray(pdfBase64);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // 🔥 SỬA LẠI 2: Truyền trực tiếp chuỗi Base64 vào pdf-lib, KHÔNG dùng toByteArray cho ảnh
      let image;
      try {
        // Mặc định SignatureCanvas trả về PNG
        image = await pdfDoc.embedPng(signatureBase64);
      } catch (e) {
        console.warn("Lỗi nhúng PNG, thử JPG...", e);
        image = await pdfDoc.embedJpg(signatureBase64);
      }

      // Lấy trang cuối cùng
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Sửa lại tọa độ này
      const sigX = width - 250; // Canh lề phải, dưới chữ BÊN THUÊ
      const sigY = 210; // Vị trí chữ ký
      const sigWidth = 180;
      const sigHeight = 80;

      // Vẽ chữ ký
      lastPage.drawImage(image, {
        x: sigX,
        y: sigY,
        width: sigWidth,
        height: sigHeight,
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBase64 = base64js.fromByteArray(modifiedPdfBytes);

      setModifiedPdfBase64(modifiedBase64);

      // Lưu ra file local
      const signedPdfPath = `${FileSystem.cacheDirectory}signed_${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(signedPdfPath, modifiedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setEmbeddedPdfUri(signedPdfPath);

      // Tự động upload sau khi embed thành công
      await handleUploadSignedPdf(signedPdfPath);
    } catch (error) {
      console.error("Lỗi nhúng chữ ký:", error);
      Alert.alert("Lỗi", "Không thể xử lý chữ ký vào PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleUploadSignedPdf = async (pdfPath: string) => {
    if (!contract?.id) return;

    try {
      setIsSigning(true);
      const formData = new FormData();
      formData.append("signedDate", new Date().toISOString());
      formData.append("contractPdf", {
        uri: pdfPath,
        name: `contract_signed_${Date.now()}.pdf`,
        type: "application/pdf",
      } as any);

      await uploadPdf(formData);

      setAgreePolicy(false);
      setSignatureImage(null);
      setEmbeddedPdfUri(null);
      setModifiedPdfBase64(null);
      handleClose();
      Alert.alert("Thành công", "Hợp đồng đã được ký và gửi");
    } catch (error) {
      console.error("Error signing contract:", error);
      Alert.alert("Lỗi", "Lỗi khi ký hợp đồng. Vui lòng thử lại.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleClose = () => {
    // Reset all signature and modal states
    setAgreePolicy(false);
    setSignatureImage(null);
    setEmbeddedPdfUri(null);
    setModifiedPdfBase64(null);
    setShowSignatureModal(false);
    setIsSigning(false);
    setPdfLoading(true);
    // Call parent's onClose
    onClose();
  };

  const handleClearSignature = () => {
    setSignatureImage(null);
    setEmbeddedPdfUri(null);
    setModifiedPdfBase64(null);
  };

  const handleClearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  const handleConfirmSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  const SignatureModal = () => {
    if (!showSignatureModal) return null;

    return (
      <View style={styles.signatureModalContainer}>
        <View style={styles.signatureModal}>
          <View style={styles.signatureHeader}>
            <View style={styles.signatureHeaderLeft}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#333"
              />
              <Text style={styles.signatureTitle}>Ký điện tử</Text>
            </View>
            <Pressable
              style={styles.closeIconButton}
              onPress={() => setShowSignatureModal(false)}
            >
              <MaterialCommunityIcons name="close" color="#999" size={22} />
            </Pressable>
          </View>

          <View style={styles.signatureContent}>
            <View style={styles.instructionBox}>
              <MaterialCommunityIcons
                name="information"
                color="#2196f3"
                size={22}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.instructionTitle}>Hướng dẫn ký</Text>
                <Text style={styles.instructionText}>
                  Vui lòng ký vào ô bên dưới. Sử dụng chuột hoặc thiết bị chạm
                  để ký.
                </Text>
              </View>
            </View>

            <View style={styles.canvasContainer}>
              <SignatureCanvas
                ref={signatureRef}
                onOK={handleSignatureCapture}
                onEmpty={() =>
                  Alert.alert(
                    "Thông báo",
                    "Vui lòng vẽ chữ ký của bạn trước khi xác nhận!",
                  )
                }
                backgroundColor="white"
                webStyle={`
    body, html {
      background-color: white !important;
    }
    .m-signature-pad {
      box-shadow: none !important;
      border: none !important;
    }
    canvas {
      background-color: white !important;
    }
  `}
              />
            </View>

            <Text style={styles.footerInstructionText}>
              Bạn có thể vẽ lại. Ấn nút Xóa để xoá và thử lại.
            </Text>
          </View>

          <View style={styles.signatureActions}>
            <Pressable
              style={[styles.actionBtn, styles.actionBtnOutline]}
              onPress={handleClearCanvas}
            >
              <Text style={styles.actionBtnOutlineText}>Xóa</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionBtnOutline]}
              onPress={() => setShowSignatureModal(false)}
            >
              <Text style={styles.actionBtnOutlineText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={handleConfirmSignature}
            >
              <MaterialCommunityIcons name="check" color="#fff" size={16} />
              <Text style={styles.actionBtnPrimaryText}>Xác nhận ký</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (!contract) return null;

  const primaryTenant = contract.members?.find(
    (m) => m.memberType === "primary",
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
              <Text style={styles.headerSubtitle}>
                Người thuê: {primaryTenant?.user?.fullName}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <MaterialCommunityIcons name="close" color="#666" size={20} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {contract.hasPdf && (
              <>
                <View style={styles.section}>
                  <View style={styles.pdfContainer}>
                    {getPdfUrl() ? (
                      <WebView
                        source={
                          modifiedPdfBase64
                            ? {
                                uri: `data:application/pdf;base64,${modifiedPdfBase64}`,
                              }
                            : { uri: getGoogleViewerUrl() }
                        }
                        style={styles.pdfWebView}
                        originWhitelist={["*"]}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        startInLoadingState={true}
                        onLoadStart={() => {
                          console.log("PDF loading started");
                          setPdfLoading(true);
                        }}
                        onLoadEnd={() => {
                          console.log("PDF loading ended");
                          setPdfLoading(false);
                        }}
                        onError={(syntheticEvent) => {
                          const { nativeEvent } = syntheticEvent;
                          console.warn("WebView error: ", nativeEvent);
                          setPdfLoading(false);
                        }}
                        onHttpError={(syntheticEvent) => {
                          const { nativeEvent } = syntheticEvent;
                          console.warn("WebView HTTP error: ", nativeEvent);
                          setPdfLoading(false);
                        }}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        bounces={false}
                        incognito={true}
                      />
                    ) : null}
                    {pdfLoading && (
                      <View style={styles.pdfLoadingContainer}>
                        <ActivityIndicator size="large" color="#2196f3" />
                        <Text style={{ marginTop: 8, color: "#666" }}>
                          Đang xử lý hợp đồng...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {contract.status === "draft" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ký điện tử</Text>

                <View style={styles.notificationBox}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    color="#2196f3"
                    size={18}
                  />
                  <Text style={styles.notificationText}>
                    Hãy đọc kỹ các điều khoản trước khi ký
                  </Text>
                </View>

                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 14,
                    padding: 14,
                    backgroundColor: "#fafafa",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#eee",
                  }}
                  onPress={() => setAgreePolicy(!agreePolicy)}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: agreePolicy ? "#2196f3" : "#ddd",
                      backgroundColor: agreePolicy ? "#2196f3" : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {agreePolicy && (
                      <MaterialCommunityIcons
                        name="check"
                        color="#fff"
                        size={14}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "#333",
                      fontWeight: "500",
                      lineHeight: 18,
                    }}
                  >
                    Tôi đồng ý với các điều khoản và điều kiện của hợp đồng này
                  </Text>
                </Pressable>

                <View style={styles.signaturePreviewSection}>
                  <Text style={styles.previewLabel}>Chữ ký điện tử</Text>
                  {signatureImage ? (
                    <>
                      <Image
                        source={{ uri: signatureImage }}
                        style={styles.signaturePreview}
                        resizeMode="contain"
                      />
                      <Pressable
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleClearSignature}
                      >
                        <MaterialCommunityIcons
                          name="refresh"
                          color="#f44336"
                          size={16}
                        />
                        <Text
                          style={[
                            styles.secondaryButtonText,
                            { color: "#f44336" },
                          ]}
                        >
                          Ký lại
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[
                        styles.button,
                        styles.primaryButton,
                        !agreePolicy && { opacity: 0.5 },
                      ]}
                      onPress={() => setShowSignatureModal(true)}
                      disabled={!agreePolicy}
                    >
                      <MaterialCommunityIcons
                        name="pen-plus"
                        color="#fff"
                        size={16}
                      />
                      <Text style={styles.primaryButtonText}>
                        Bắt đầu vẽ chữ ký
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        <SignatureModal />
      </View>
    </Modal>
  );
};
