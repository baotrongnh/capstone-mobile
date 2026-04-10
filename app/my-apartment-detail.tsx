import { MaterialCommunityIcons } from "@expo/vector-icons"
import ApartmentHeader from "@/components/my-apartment/ApartmentHeader"
import ChangeHousePasswordModal from "@/components/my-apartment/ChangeHousePasswordModal"
import DetailRow from "@/components/my-apartment/DetailRow"
import SectionCard from "@/components/my-apartment/SectionCard"
import { StyledContainer } from "@/components/styles"
import { useUpdateMyHousePassword, useUserApartment, useUserApartmentDetail } from "@/hooks/query/useUserApartment"
import { UserApartmentDetailItem, UserApartmentItem } from "@/types/userApartment"
import {
    formatAddress,
    formatArea,
    formatCurrency,
    formatDate,
    formatTenantStatus,
    getApartmentStatusMeta,
    getApiErrorMessage,
    isValidHousePassword,
    maskSecret,
    toDisplayText,
} from "@/utils/userApartment"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"

export default function MyApartmentDetail() {
    const router = useRouter()
    const params = useLocalSearchParams<{ id?: string }>()
    const userApartmentId = typeof params?.id === "string" ? params.id : ""

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back()
            return
        }

        router.replace("/my-apartments")
    }

    const [showDoorPassword, setShowDoorPassword] = useState(false)
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [newHousePassword, setNewHousePassword] = useState("")
    const [confirmNewHousePassword, setConfirmNewHousePassword] = useState("")

    const {
        data: detailData,
        isLoading: isDetailLoading,
        isRefetching: isDetailRefetching,
        refetch: refetchDetail,
        error: detailError,
    } = useUserApartmentDetail(userApartmentId)

    const {
        data: myData,
        isLoading: isMyLoading,
        isRefetching: isMyRefetching,
        refetch: refetchMy,
        error: myError,
    } = useUserApartment()

    const {
        mutateAsync: updateHousePassword,
        isPending: isUpdatingHousePassword,
    } = useUpdateMyHousePassword()

    React.useEffect(() => {
        const onBackPress = () => {
            if (showChangePasswordModal) {
                if (isUpdatingHousePassword) {
                    return true
                }

                setShowChangePasswordModal(false)
                return true
            }

            handleBack()
            return true
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
        return () => subscription.remove()
    }, [isUpdatingHousePassword, router, showChangePasswordModal])

    const userApartment = useMemo<UserApartmentDetailItem | undefined>(() => {
        if (userApartmentId) {
            return detailData?.data as UserApartmentDetailItem | undefined
        }

        const firstApartment = myData?.data?.[0] as UserApartmentItem | undefined
        if (!firstApartment) {
            return undefined
        }

        return firstApartment as unknown as UserApartmentDetailItem
    }, [detailData, myData, userApartmentId])

    const isLoading = userApartmentId ? isDetailLoading : isMyLoading
    const isRefetching = userApartmentId ? isDetailRefetching : isMyRefetching
    const refetch = userApartmentId ? refetchDetail : refetchMy
    const error = userApartmentId ? detailError : myError

    const apartment = userApartment?.apartment
    const statusMeta = getApartmentStatusMeta(apartment?.status)
    const amenities = useMemo(
        () => {
            const amenityList = apartment?.apartmentAmenities

            if (Array.isArray(amenityList)) {
                return amenityList
                    .map((item) => toDisplayText(item.amenity?.name ?? item.amenity?.code, ""))
                    .filter((item) => item.length > 0)
            }

            const rawAmenities = apartment?.amenities
            if (Array.isArray(rawAmenities)) {
                return rawAmenities
                    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
                    .map((item) => item.replace(/_/g, " "))
            }

            return []
        },
        [apartment],
    )

    const apartmentImages = useMemo(
        () => {
            const rawImages = apartment?.images as unknown

            if (!Array.isArray(rawImages)) {
                return []
            }

            return rawImages.filter(
                (image): image is string => typeof image === "string" && image.trim().length > 0,
            )
        },
        [apartment?.images],
    )

    const buildingName = toDisplayText(apartment?.buildingName)
    const apartmentNumber = toDisplayText(apartment?.apartmentNumber)
    const apartmentTitle =
        buildingName !== "--"
            ? buildingName
            : apartmentNumber !== "--"
                ? `Căn ${apartmentNumber}`
                : "Căn hộ của tôi"

    const displayedAddress = formatAddress(apartment?.streetAddress, apartment?.wardCode, apartment?.provinceCode)

    const displayedDoorPassword = showDoorPassword
        ? toDisplayText(userApartment?.apartmentDoorPassword)
        : maskSecret(userApartment?.apartmentDoorPassword)

    const openChangePasswordModal = () => {
        setNewHousePassword("")
        setConfirmNewHousePassword("")
        setShowChangePasswordModal(true)
    }

    const closeChangePasswordModal = () => {
        if (isUpdatingHousePassword) {
            return
        }
        setShowChangePasswordModal(false)
    }

    const submitChangePassword = async () => {
        if (!userApartment?.id) {
            return
        }

        if (!isValidHousePassword(newHousePassword)) {
            Alert.alert("Thông báo", "Mật khẩu nhà phải là 4-12 chữ số")
            return
        }

        if (newHousePassword !== confirmNewHousePassword) {
            Alert.alert("Thông báo", "Xác nhận mật khẩu chưa khớp")
            return
        }

        try {
            await updateHousePassword({
                id: String(userApartment.id),
                payload: { housePassword: newHousePassword },
            })

            setShowDoorPassword(false)
            setShowChangePasswordModal(false)
            setNewHousePassword("")
            setConfirmNewHousePassword("")
            Alert.alert("Thành công", "Đã đổi mật khẩu cửa nhà")
        } catch (mutationError) {
            Alert.alert(
                "Lỗi",
                getApiErrorMessage(mutationError, "Không thể đổi mật khẩu nhà lúc này"),
            )
        }
    }

    if (isLoading) {
        return (
            <StyledContainer style={styles.container}>
                <View style={styles.breadcrumbRow}>
                    <Pressable style={styles.breadcrumbBack} onPress={handleBack} hitSlop={10}>
                        <Ionicons name="chevron-back" size={24} color="#6b7280" />
                        <Text style={styles.breadcrumbBackText}>Căn hộ</Text>
                    </Pressable>
                </View>

                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.centerText}>Đang tải thông tin căn hộ...</Text>
                </View>
            </StyledContainer>
        )
    }

    return (
        <StyledContainer style={styles.container}>
            <View style={styles.breadcrumbRow}>
                <Pressable style={styles.breadcrumbBack} onPress={handleBack} hitSlop={10}>
                    <Ionicons name="chevron-back" size={24} color="#6b7280" />
                    <Text style={styles.breadcrumbBackText}>Căn hộ</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#3b82f6"
                    />
                }
            >
                {userApartment ? (
                    <>
                        <ApartmentHeader
                            apartmentTitle={apartmentTitle}
                            address={displayedAddress}
                            statusLabel={statusMeta.label}
                            statusBackgroundColor={statusMeta.backgroundColor}
                            statusTextColor={statusMeta.textColor}
                            isPrimaryTenant={Boolean(userApartment?.isPrimaryTenant)}
                            apartmentImages={apartmentImages}
                        />
                        <SectionCard title="Thông tin thuê">
                            <DetailRow label="Trạng thái cư dân" value={formatTenantStatus(userApartment.status)} />
                            <DetailRow label="Ngày vào ở" value={formatDate(userApartment.moveInDate)} />
                            <DetailRow label="Ngày dự kiến rời đi" value={formatDate(userApartment.moveOutDate)} />
                            <DetailRow
                                label="Số hợp đồng"
                                value={toDisplayText(userApartment.rentalContract?.contractNumber)}
                            />
                        </SectionCard>

                        <SectionCard title="Thông tin căn hộ">
                            <DetailRow label="Mã căn hộ" value={apartmentNumber} />
                            <DetailRow label="Tòa nhà" value={buildingName} />
                            <DetailRow label="Tầng" value={toDisplayText(apartment?.floorNumber)} />
                            <DetailRow label="Địa chỉ" value={displayedAddress} />
                            <DetailRow label="Phòng ngủ" value={toDisplayText(apartment?.numberOfBedrooms)} />
                            <DetailRow label="Phòng tắm" value={toDisplayText(apartment?.numberOfBathrooms)} />
                            <DetailRow label="Tổng diện tích" value={formatArea(apartment?.totalArea)} />
                            <DetailRow label="Diện tích sử dụng" value={formatArea(apartment?.usableArea)} />
                            <DetailRow label="Tiền thuê" value={formatCurrency(apartment?.baseRentPrice)} />
                            <DetailRow label="Tiền cọc" value={formatCurrency(apartment?.depositAmount)} />
                            <DetailRow label="Năm xây dựng" value={toDisplayText(apartment?.yearBuilt)} />
                            <DetailRow label="Nội thất" value={toDisplayText(apartment?.furnishingStatus)} />
                        </SectionCard>

                        <SectionCard title="Thông tin truy cập">
                            <View style={styles.passwordRow}>
                                <View style={styles.passwordInfo}>
                                    <Text style={styles.passwordLabel}>Mật khẩu cửa</Text>
                                    <Text style={styles.passwordValue}>{displayedDoorPassword}</Text>
                                </View>

                                <View style={styles.passwordActions}>
                                    <Pressable
                                        style={styles.iconActionButton}
                                        onPress={() => setShowDoorPassword((prev) => !prev)}
                                    >
                                        <MaterialCommunityIcons
                                            name={showDoorPassword ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color="#1e40af"
                                        />
                                    </Pressable>
                                    <Pressable style={styles.changePasswordButton} onPress={openChangePasswordModal}>
                                        <MaterialCommunityIcons name="lock-reset" size={16} color="#1e40af" />
                                        <Text style={styles.changePasswordButtonText}>Đổi mật khẩu</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <DetailRow label="Mã cổng tòa nhà" value={toDisplayText(userApartment.buildingGateCode)} />
                            <DetailRow label="Mã khóa thông minh" value={toDisplayText(userApartment.smartLockPin)} />
                            <DetailRow label="Mã hộp thư" value={toDisplayText(userApartment.mailboxCode)} />
                            <DetailRow label="Mã vào bãi xe" value={toDisplayText(userApartment.parkingAccessCode)} />
                            <DetailRow label="Wi-Fi" value={toDisplayText(userApartment.wifiName)} />
                            <DetailRow label="Mật khẩu Wi-Fi" value={toDisplayText(userApartment.wifiPassword)} />
                            <DetailRow label="Liên hệ khẩn cấp" value={toDisplayText(userApartment.emergencyContactName)} />
                            <DetailRow label="SĐT khẩn cấp" value={toDisplayText(userApartment.emergencyContactPhone)} />
                        </SectionCard>

                        <SectionCard title="Tiện ích">
                            {amenities.length > 0 ? (
                                <View style={styles.amenitiesContainer}>
                                    {amenities.map((item) => (
                                        <View key={item} style={styles.amenityChip}>
                                            <Text style={styles.amenityChipText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>Chưa có thông tin tiện ích</Text>
                            )}
                        </SectionCard>

                        <SectionCard title="Mô tả">
                            <Text style={styles.descriptionText}>{toDisplayText(apartment?.description)}</Text>
                        </SectionCard>
                    </>
                ) : (
                    <View style={styles.stateCard}>
                        <MaterialCommunityIcons name="home-off-outline" size={44} color="#94a3b8" />
                        <Text style={styles.stateTitle}>Bạn chưa được gán căn hộ nào</Text>
                        <Text style={styles.stateMessage}>
                            Vui lòng liên hệ ban quản lý để được cập nhật thông tin căn hộ.
                        </Text>
                    </View>
                )}

                {error && !userApartment ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>Không thể tải dữ liệu căn hộ. Vui lòng thử lại.</Text>
                        <Pressable style={styles.retryButton} onPress={() => refetch()}>
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.retryButton, { backgroundColor: "#2563eb", marginTop: 4 }]}
                            onPress={handleBack}
                        >
                            <Text style={styles.retryButtonText}>Về danh sách căn hộ</Text>
                        </Pressable>
                    </View>
                ) : null}
            </ScrollView>

            <ChangeHousePasswordModal
                visible={showChangePasswordModal}
                newHousePassword={newHousePassword}
                confirmNewHousePassword={confirmNewHousePassword}
                isUpdating={isUpdatingHousePassword}
                onChangeNewPassword={setNewHousePassword}
                onChangeConfirmPassword={setConfirmNewHousePassword}
                onClose={closeChangePasswordModal}
                onSubmit={submitChangePassword}
            />
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f3f5f9",
        paddingHorizontal: 18,
    },
    content: {
        gap: 14,
        paddingBottom: 130,
    },
    breadcrumbRow: {
        marginBottom: 4,
    },
    breadcrumbBack: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 4,
        paddingVertical: 4,
        paddingRight: 4,
    },
    breadcrumbBackText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6d6d6d",
    },
    centerContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    centerText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
    },
    passwordRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 8,
        marginBottom: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    passwordInfo: {
        flex: 1,
        gap: 2,
    },
    passwordLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    passwordValue: {
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "700",
        letterSpacing: 0.6,
    },
    passwordActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconActionButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
    },
    changePasswordButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#bfdbfe",
        backgroundColor: "#eff6ff",
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    changePasswordButtonText: {
        fontSize: 12,
        color: "#1e40af",
        fontWeight: "700",
    },
    amenitiesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    amenityChip: {
        borderRadius: 999,
        backgroundColor: "#ecfeff",
        borderWidth: 1,
        borderColor: "#a5f3fc",
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    amenityChipText: {
        color: "#155e75",
        fontSize: 12,
        fontWeight: "700",
    },
    emptyText: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "600",
    },
    descriptionText: {
        fontSize: 14,
        color: "#0f172a",
        lineHeight: 21,
    },
    stateCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        backgroundColor: "#f8fafc",
        padding: 20,
        alignItems: "center",
        gap: 8,
    },
    stateTitle: {
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "800",
        textAlign: "center",
    },
    stateMessage: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 20,
    },
    errorCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fecaca",
        backgroundColor: "#fef2f2",
        padding: 14,
        gap: 10,
    },
    errorText: {
        color: "#b91c1c",
        fontSize: 13,
        fontWeight: "700",
    },
    retryButton: {
        alignSelf: "flex-start",
        backgroundColor: "#dc2626",
        borderRadius: 10,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    retryButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
})
