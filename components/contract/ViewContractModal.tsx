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
  },
  content: {
    padding: 20,
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

  const SIGNATURE_CONFIG = {
    x: 130,
    y: 200,
    width: 100,
    height: 50,
  };

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

      // ===== 1. Extract base64 =====
      const signatureBase64 = signature.includes(",")
        ? signature.split(",")[1]
        : signature;

      // ===== 2. Download PDF =====
      const tempDownloadUri = FileSystem.cacheDirectory + "temp_contract.pdf";
      const { uri } = await FileSystem.downloadAsync(
        originalPdfUrl,
        tempDownloadUri,
      );

      // ===== 3. Read PDF =====
      const pdfBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 🔥 FIX QUAN TRỌNG: load bằng bytes
      const pdfBytes = base64js.toByteArray(pdfBase64);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // ===== 4. Convert signature =====
      const signatureBytes = base64js.toByteArray(signatureBase64);

      // 🔥 FIX QUAN TRỌNG: detect format
      let image;
      if (signature.startsWith("data:image/png")) {
        image = await pdfDoc.embedPng(signatureBytes);
      } else {
        image = await pdfDoc.embedJpg(signatureBytes);
      }

      // ===== 5. Draw thử rectangle (debug - có thể xoá sau) =====
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      lastPage.drawRectangle({
        x: 80,
        y: 320,
        width: 120,
        height: 60,
        color: rgb(1, 0, 0), // đỏ -> để test
      });

      // ===== 6. Draw signature =====
      lastPage.drawImage(image, {
        x: 80,
        y: 320,
        width: 120,
        height: 60,
      });

      // ===== 7. Save PDF =====
      const modifiedPdfBytes = await pdfDoc.save();

      const modifiedBase64 = base64js.fromByteArray(modifiedPdfBytes);

      setModifiedPdfBase64(modifiedBase64);

      // ===== 8. Write file =====
      const signedPdfPath = `${FileSystem.cacheDirectory}signed_${Date.now()}.pdf`;

      await FileSystem.writeAsStringAsync(signedPdfPath, modifiedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setEmbeddedPdfUri(signedPdfPath);
    } catch (error) {
      console.error("Lỗi nhúng chữ ký:", error);
      Alert.alert("Lỗi", "Không thể xử lý chữ ký vào PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleStartSignature = () => {
    setShowSignatureModal(true);
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

  const handleSignAndSend = async () => {
    if (!agreePolicy) {
      Alert.alert("Thông báo", "Vui lòng đồng ý với chính sách trước khi ký");
      return;
    }

    if (!signatureImage) {
      Alert.alert("Thông báo", "Vui lòng ký hợp đồng trước khi gửi");
      return;
    }

    if (!contract?.id) return;

    try {
      setIsSigning(true);

      console.log("\n=== STEP 1: Prepare FormData ===");
      const formData = new FormData();
      formData.append("signedDate", new Date().toISOString());
      console.log("✓ Added signedDate");

      // Append PDF with signature embedded
      if (modifiedPdfBase64) {
        console.log("\n=== STEP 2: Convert PDF Base64 to Blob ===");
        console.log("modifiedPdfBase64 length:", modifiedPdfBase64.length);

        // Convert base64 to blob using fetch (React Native compatible)
        const response = await fetch(
          `data:application/pdf;base64,${modifiedPdfBase64}`,
        );
        const blob = await response.blob();
        console.log("✓ PDF Blob created, size:", blob.size, "type:", blob.type);

        formData.append("contractDocumentUrl", blob, "contract_signed.pdf");
        console.log("✓ PDF appended to formData");
      } else {
        console.warn("⚠️  modifiedPdfBase64 is null/undefined!");
      }

      // Append signature image
      if (signatureImage) {
        console.log("\n=== STEP 3: Convert Signature to Blob ===");
        console.log("signatureImage length:", signatureImage.length);

        const response = await fetch(signatureImage);
        const blob = await response.blob();
        console.log(
          "✓ Signature Blob created, size:",
          blob.size,
          "type:",
          blob.type,
        );

        formData.append("signature", blob, "signature.png");
        console.log("✓ Signature appended to formData");
      }

      console.log("\n=== STEP 4: Send to API ===");
      console.log("Contract ID:", contract?.id);
      console.log("FormData ready, sending...");

      await uploadPdf(formData);

      console.log("✓ Upload successful!");

      setAgreePolicy(false);
      setSignatureImage(null);
      setEmbeddedPdfUri(null);
      setModifiedPdfBase64(null);
      handleClose();
      Alert.alert("Thành công", "Hợp đồng đã được ký và gửi");
    } catch (error) {
      console.error("Error signing contract:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack",
      });
      Alert.alert("Lỗi", "Lỗi khi ký hợp đồng. Vui lòng thử lại.");
    } finally {
      setIsSigning(false);
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
            <View style={styles.alertBox}>
              <MaterialCommunityIcons
                name="information"
                color="#2196f3"
                size={20}
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  Hợp đồng: {contract.contractNumber}
                </Text>
                <Text style={styles.alertDescription}>
                  Người thuê: {primaryTenant?.user?.fullName}
                </Text>
              </View>
            </View>

            {contract.hasPdf && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tệp hợp đồng</Text>
                  <View style={styles.pdfContainer}>
                    {getPdfUrl() ? (
                      <WebView
                        source={
                          embeddedPdfUri
                            ? { uri: embeddedPdfUri }
                            : { uri: getGoogleViewerUrl() }
                        }
                        style={styles.pdfWebView}
                        originWhitelist={["*"]}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
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
                          Alert.alert(
                            "Lỗi",
                            "Không thể hiển thị file PDF. Vui lòng thử tải xuống.",
                          );
                        }}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        bounces={false}
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

            {contract.status === "signed" && (
              <View style={styles.notificationBox}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  color="#2196f3"
                  size={18}
                />
                <Text style={styles.notificationText}>
                  Hợp đồng đã ký. Vui lòng chờ xác nhận kích hoạt
                </Text>
              </View>
            )}

            {contract.status === "active" && (
              <View
                style={[
                  styles.notificationBox,
                  { borderLeftColor: "#4caf50", backgroundColor: "#f0f8f5" },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  color="#4caf50"
                  size={18}
                />
                <Text style={[styles.notificationText, { color: "#1b5e20" }]}>
                  Hợp đồng đã được kích hoạt. Thanh toán định kỳ sẽ được yêu cầu
                </Text>
              </View>
            )}

            {contract.status === "draft" && (
              <>
                <View style={styles.divider} />
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
                        backgroundColor: agreePolicy
                          ? "#2196f3"
                          : "transparent",
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
                      Tôi đồng ý với các điều khoản và điều kiện của hợp đồng
                      này
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
                        onPress={handleStartSignature}
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
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {contract.status === "draft" && (
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  (!agreePolicy ||
                    !signatureImage ||
                    isSigning ||
                    isPending) && {
                    opacity: 0.6,
                  },
                ]}
                onPress={handleSignAndSend}
                disabled={
                  !agreePolicy || !signatureImage || isSigning || isPending
                }
              >
                {isSigning || isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="pen" color="#fff" size={16} />
                    <Text style={styles.primaryButtonText}>Ký & Gửi</Text>
                  </>
                )}
              </Pressable>
            )}

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleClose}
            >
              <Text style={styles.secondaryButtonText}>Đóng</Text>
            </Pressable>
          </View>
        </View>

        <SignatureModal />
      </View>
    </Modal>
  );
};
