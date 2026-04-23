import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import ApartmentHeader from "@/components/my-apartment/ApartmentHeader"
import ChangeHousePasswordModal from "@/components/my-apartment/ChangeHousePasswordModal"
import DetailRow from "@/components/my-apartment/DetailRow"
import SectionCard from "@/components/my-apartment/SectionCard"
import { StyledContainer } from "@/components/styles"
import { IOT_TOPIC_ICON_MAP } from "@/constants/myApartment"
import { useIotBoardsByApartment, useUpdateDoorPin, useUserApartment, useUserApartmentDetail } from "@/hooks/query/useUserApartment"
import { DoorPinTarget, UserApartmentDetailItem, UserApartmentItem } from "@/types/userApartment"
import { buildApartmentIotDevices, resolveDoorPinTargetFromBoards } from "@/utils/iot"
import { formatContractCategory, formatContractMemberStatus, formatContractMemberType, formatContractStatus, formatIotState, formatPaymentMethod } from "@/utils/myApartment"
import {
    formatAddress,
    formatArea,
    formatCurrency,
    formatDate,
    formatFurnishing,
    formatTenantStatus,
    getApartmentStatusMeta,
    getApiErrorMessage,
    hasDisplayValue,
    isValidHousePassword,
    toDisplayText,
} from "@/utils/userApartment"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Linking,
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

    const handleBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back()
            return
        }

        router.replace("/my-apartments")
    }, [router])

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [hasCompletedFirstPassSetup, setHasCompletedFirstPassSetup] = useState(false)
    const [oldHousePassword, setOldHousePassword] = useState("")
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
        mutateAsync: updateDoorPin,
        isPending: isUpdatingHousePassword,
    } = useUpdateDoorPin()

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

    const apartmentId = typeof userApartment?.apartmentId === "string" ? userApartment.apartmentId : undefined

    const { data: iotBoardsData, refetch: refetchIotBoards } = useIotBoardsByApartment(apartmentId)

    const iotDevices = useMemo(
        () => buildApartmentIotDevices(iotBoardsData?.data, apartmentId),
        [apartmentId, iotBoardsData?.data],
    )

    const doorPinTarget = useMemo<DoorPinTarget | null>(
        () => resolveDoorPinTargetFromBoards(iotBoardsData?.data, apartmentId),
        [apartmentId, iotBoardsData?.data],
    )

    const isLoading = userApartmentId ? isDetailLoading : isMyLoading
    const isRefetching = userApartmentId ? isDetailRefetching : isMyRefetching
    const refetch = userApartmentId ? refetchDetail : refetchMy
    const error = userApartmentId ? detailError : myError

    const apartment = userApartment?.apartment
    const rentalContract = userApartment?.rentalContract
    const contractMembers = Array.isArray(rentalContract?.members) ? rentalContract.members : []
    const statusMeta = getApartmentStatusMeta(apartment?.status)
    const isFirstPassSetup = Boolean(userApartment?.isFirstPass)
    const isModalForcedByFirstPass = isFirstPassSetup && !hasCompletedFirstPassSetup
    const emergencyContactName = userApartment?.emergencyContactName ?? userApartment?.user?.emergencyContactName
    const emergencyContactPhone = userApartment?.emergencyContactPhone ?? userApartment?.user?.emergencyContactPhone

    useEffect(() => {
        const onBackPress = () => {
            if (showChangePasswordModal || isModalForcedByFirstPass) {
                if (isUpdatingHousePassword) {
                    return true
                }

                if (isModalForcedByFirstPass) {
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
    }, [handleBack, isModalForcedByFirstPass, isUpdatingHousePassword, showChangePasswordModal])
    const videoTourUrl = useMemo(() => {
        if (typeof apartment?.videoTourUrl !== "string") {
            return null
        }

        const normalized = apartment.videoTourUrl.trim()
        return normalized.length > 0 ? normalized : null
    }, [apartment?.videoTourUrl])

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

    const contractDuration = useMemo(() => {
        if (!rentalContract) {
            return "--"
        }

        return `${formatDate(rentalContract.startDate)} - ${formatDate(rentalContract.endDate)}`
    }, [rentalContract])

    const rentalRows = useMemo(() => {
        const rows: { label: string; value: string }[] = [
            { label: "Trạng thái cư dân", value: formatTenantStatus(userApartment?.status) },
            { label: "Cư dân chính", value: userApartment?.isPrimaryTenant ? "Có" : "Không" },
            { label: "Ngày vào ở", value: formatDate(userApartment?.moveInDate) },
            { label: "Ngày dự kiến rời đi", value: formatDate(userApartment?.moveOutDate) },
        ]

        if (hasDisplayValue(userApartment?.rentalContract?.contractNumber)) {
            rows.push({
                label: "Số hợp đồng",
                value: toDisplayText(userApartment?.rentalContract?.contractNumber),
            })
        }

        if (rentalContract) {
            rows.push({ label: "Thời hạn hợp đồng", value: contractDuration })
            rows.push({ label: "Trạng thái hợp đồng", value: formatContractStatus(rentalContract.status) })
            rows.push({ label: "Phương thức thanh toán", value: formatPaymentMethod(rentalContract.paymentMethod) })
            rows.push({ label: "Loại hợp đồng", value: formatContractCategory(rentalContract.category) })
        }

        return rows
    }, [
        contractDuration,
        userApartment?.isPrimaryTenant,
        userApartment?.moveInDate,
        userApartment?.moveOutDate,
        userApartment?.rentalContract?.contractNumber,
        userApartment?.status,
        rentalContract,
    ])

    const apartmentRows = useMemo(() => {
        const rows: { label: string; value: string }[] = [
            { label: "Mã căn hộ", value: apartmentNumber },
            { label: "Tòa nhà", value: buildingName },
            { label: "Địa chỉ", value: displayedAddress },
        ]

        if (hasDisplayValue(apartment?.floorNumber)) {
            rows.splice(2, 0, { label: "Tầng", value: toDisplayText(apartment?.floorNumber) })
        }

        if (hasDisplayValue(apartment?.numberOfBedrooms)) {
            rows.push({ label: "Phòng ngủ", value: toDisplayText(apartment?.numberOfBedrooms) })
        }

        if (hasDisplayValue(apartment?.numberOfBathrooms)) {
            rows.push({ label: "Phòng tắm", value: toDisplayText(apartment?.numberOfBathrooms) })
        }

        if (hasDisplayValue(apartment?.usableArea)) {
            rows.push({ label: "Diện tích sử dụng", value: formatArea(apartment?.usableArea) })
        }

        if (hasDisplayValue(apartment?.totalArea)) {
            rows.push({ label: "Tổng diện tích", value: formatArea(apartment?.totalArea) })
        }

        if (hasDisplayValue(apartment?.depositAmount)) {
            rows.push({ label: "Tiền cọc", value: formatCurrency(apartment?.depositAmount) })
        }

        if (hasDisplayValue(apartment?.furnishingStatus)) {
            rows.push({ label: "Nội thất", value: formatFurnishing(apartment?.furnishingStatus) })
        }

        if (hasDisplayValue(apartment?.yearBuilt)) {
            rows.push({ label: "Năm xây dựng", value: toDisplayText(apartment?.yearBuilt) })
        }

        return rows
    }, [
        apartment?.depositAmount,
        apartment?.floorNumber,
        apartment?.furnishingStatus,
        apartment?.numberOfBathrooms,
        apartment?.numberOfBedrooms,
        apartment?.totalArea,
        apartment?.usableArea,
        apartment?.yearBuilt,
        apartmentNumber,
        buildingName,
        displayedAddress,
    ])

    const openChangePasswordModal = () => {
        setOldHousePassword("")
        setNewHousePassword("")
        setConfirmNewHousePassword("")
        setShowChangePasswordModal(true)
    }

    const openVideoTour = useCallback(async () => {
        if (!videoTourUrl) {
            return
        }

        try {
            const supported = await Linking.canOpenURL(videoTourUrl)

            if (!supported) {
                Alert.alert("Video tour", "Không thể mở liên kết video tour")
                return
            }

            await Linking.openURL(videoTourUrl)
        } catch {
            Alert.alert("Video tour", "Không thể mở liên kết video tour")
        }
    }, [videoTourUrl])

    const closeChangePasswordModal = () => {
        if (isUpdatingHousePassword) {
            return
        }
        setShowChangePasswordModal(false)
    }

    const submitChangePassword = async () => {
        if (!apartmentId) {
            return
        }

        if (isFirstPassSetup) {
            if (!isValidHousePassword(newHousePassword)) {
                Alert.alert("Thông báo", "Mật khẩu mới phải gồm 6 chữ số")
                return
            }

            if (newHousePassword !== confirmNewHousePassword) {
                Alert.alert("Thông báo", "Xác nhận mật khẩu chưa khớp")
                return
            }
        } else {
            if (!isValidHousePassword(oldHousePassword)) {
                Alert.alert("Thông báo", "Mật khẩu hiện tại phải gồm 6 chữ số")
                return
            }

            if (!isValidHousePassword(newHousePassword)) {
                Alert.alert("Thông báo", "Mật khẩu mới phải gồm 6 chữ số")
                return
            }

            if (oldHousePassword === newHousePassword) {
                Alert.alert("Thông báo", "Mật khẩu mới phải khác mật khẩu hiện tại")
                return
            }

            if (newHousePassword !== confirmNewHousePassword) {
                Alert.alert("Thông báo", "Xác nhận mật khẩu chưa khớp")
                return
            }
        }

        try {
            let target = doorPinTarget

            if (!target) {
                const latestBoards = await refetchIotBoards()
                target = resolveDoorPinTargetFromBoards(latestBoards.data?.data, apartmentId)
            }

            if (!target) {
                Alert.alert("Thông báo", "Không tìm thấy thiết bị cửa để đổi mật khẩu")
                return
            }

            const response = await updateDoorPin({
                boardId: target.boardId,
                deviceId: target.deviceId,
                payload: {
                    newPin: newHousePassword,
                    ...(isFirstPassSetup ? {} : { oldPin: oldHousePassword }),
                },
            })

            if (!response?.data?.success) {
                Alert.alert(
                    "Lỗi",
                    response?.data?.message || "Không thể đổi mật khẩu nhà lúc này",
                )
                return
            }

            setHasCompletedFirstPassSetup(true)
            setShowChangePasswordModal(false)
            setOldHousePassword("")
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
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={handleBack} hitSlop={10}>
                        <Ionicons name="chevron-back" size={24} color="#334155" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Chi tiết căn hộ</Text>
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
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleBack} hitSlop={10}>
                    <Ionicons name="chevron-back" size={24} color="#334155" />
                </Pressable>
                <Text style={styles.headerTitle}>Chi tiết căn hộ</Text>
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
                            {rentalRows.map((row) => (
                                <DetailRow key={row.label} label={row.label} value={row.value} />
                            ))}
                        </SectionCard>

                        {contractMembers.length > 0 ? (
                            <SectionCard title="Thành viên hợp đồng">
                                <View style={styles.contractMembersList}>
                                    {contractMembers.map((member, index) => (
                                        <View
                                            key={String(member.id ?? `${member.user?.id ?? "member"}-${index}`)}
                                            style={styles.contractMemberCard}
                                        >
                                            <Text style={styles.contractMemberName}>
                                                {toDisplayText(member.user?.fullName, "Thành viên")}
                                            </Text>
                                            <Text style={styles.contractMemberMeta}>
                                                {toDisplayText(member.user?.phone)}
                                            </Text>
                                            <Text style={styles.contractMemberMeta}>
                                                {formatContractMemberType(member.memberType)} - {formatContractMemberStatus(member.status)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </SectionCard>
                        ) : null}

                        <SectionCard title="Thông tin căn hộ">
                            {apartmentRows.map((row) => (
                                <DetailRow key={row.label} label={row.label} value={row.value} />
                            ))}
                        </SectionCard>

                        {iotDevices.length > 0 ? (
                            <SectionCard title="Thiết bị IoT">
                                <View style={styles.iotDevicesList}>
                                    {iotDevices.map((device) => {
                                        const stateMeta = formatIotState(device.state)
                                        const topicIcon = (IOT_TOPIC_ICON_MAP[device.normalizedTopic] ?? IOT_TOPIC_ICON_MAP.unknown) as keyof typeof MaterialCommunityIcons.glyphMap

                                        return (
                                            <View key={device.key} style={styles.iotDeviceCard}>
                                                <View style={styles.iotDeviceIconWrap}>
                                                    <MaterialCommunityIcons name={topicIcon} size={18} color="#2563eb" />
                                                </View>

                                                <View style={styles.iotDeviceBody}>
                                                    <Text style={styles.iotDeviceName}>{toDisplayText(device.deviceName, "Thiết bị IoT")}</Text>
                                                    <Text style={styles.iotDeviceSub}>Board: {toDisplayText(device.boardId)}</Text>
                                                </View>

                                                <View style={[styles.iotDeviceStateBadge, stateMeta.isOn ? styles.iotStateOn : styles.iotStateOff]}>
                                                    <Text style={[styles.iotDeviceStateText, stateMeta.isOn ? styles.iotStateOnText : styles.iotStateOffText]}>
                                                        {stateMeta.label}
                                                    </Text>
                                                </View>
                                            </View>
                                        )
                                    })}
                                </View>
                            </SectionCard>
                        ) : null}

                        {videoTourUrl ? (
                            <SectionCard title="Video tour">
                                <Text style={styles.videoTourDescription}>Khám phá căn hộ qua video tham quan trực tuyến.</Text>
                                <Pressable style={styles.videoTourButton} onPress={() => void openVideoTour()}>
                                    <MaterialCommunityIcons name="play-circle-outline" size={20} color="#1e40af" />
                                    <Text style={styles.videoTourButtonText}>Xem video tour</Text>
                                </Pressable>
                                <Text numberOfLines={1} style={styles.videoTourUrlText}>{videoTourUrl}</Text>
                            </SectionCard>
                        ) : null}

                        <SectionCard title="Thông tin truy cập">
                            <View style={styles.passwordRow}>
                                <View style={styles.passwordInfo}>
                                    <Text style={styles.passwordLabel}>Mật khẩu cửa</Text>
                                    <Text style={styles.passwordHint}>
                                        {isFirstPassSetup ? "Vui lòng thiết lập lần đầu để sử dụng cửa" : "Nhấn để đổi mật khẩu cửa"}
                                    </Text>
                                </View>

                                <Pressable style={styles.changePasswordButton} onPress={openChangePasswordModal}>
                                    <MaterialCommunityIcons name="lock-reset" size={16} color="#1e40af" />
                                    <Text style={styles.changePasswordButtonText}>
                                        {isFirstPassSetup ? "Thiết lập mật khẩu nhà" : "Đổi mật khẩu nhà"}
                                    </Text>
                                </Pressable>
                            </View>

                            {hasDisplayValue(emergencyContactName) ? (
                                <DetailRow key="emergencyContactName" label="Liên hệ khẩn cấp" value={toDisplayText(emergencyContactName)} />
                            ) : null}

                            {hasDisplayValue(emergencyContactPhone) ? (
                                <DetailRow key="emergencyContactPhone" label="SĐT khẩn cấp" value={toDisplayText(emergencyContactPhone)} />
                            ) : null}

                            {hasDisplayValue(userApartment?.notes) ? (
                                <DetailRow key="notes" label="Ghi chú" value={toDisplayText(userApartment?.notes)} />
                            ) : null}
                        </SectionCard>

                        {amenities.length > 0 ? (
                            <SectionCard title="Tiện ích">
                                <View style={styles.amenitiesContainer}>
                                    {amenities.map((item) => (
                                        <View key={item} style={styles.amenityChip}>
                                            <Text style={styles.amenityChipText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </SectionCard>
                        ) : null}

                        {hasDisplayValue(apartment?.description) ? (
                            <SectionCard title="Mô tả">
                                <Text style={styles.descriptionText}>{toDisplayText(apartment?.description)}</Text>
                            </SectionCard>
                        ) : null}
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
                visible={isModalForcedByFirstPass || showChangePasswordModal}
                oldHousePassword={oldHousePassword}
                newHousePassword={newHousePassword}
                confirmNewHousePassword={confirmNewHousePassword}
                isUpdating={isUpdatingHousePassword}
                isFirstPassSetup={isFirstPassSetup}
                helperText={isFirstPassSetup ? "Vì chính sách bảo mật, vui lòng thiết lập mật khẩu cửa lần đầu để sử dụng cửa." : undefined}
                onChangeOldPassword={setOldHousePassword}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 18,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        marginLeft: 10,
        fontSize: 22,
        fontWeight: "700",
        color: "#0f172a",
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
    contractMembersList: {
        gap: 8,
    },
    contractMemberCard: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 2,
    },
    contractMemberName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
    },
    contractMemberMeta: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    iotDevicesList: {
        gap: 8,
    },
    iotDeviceCard: {
        borderWidth: 1,
        borderColor: "#dbe5f3",
        borderRadius: 12,
        backgroundColor: "#f8fbff",
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iotDeviceIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
    },
    iotDeviceBody: {
        flex: 1,
        gap: 1,
    },
    iotDeviceName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0f172a",
    },
    iotDeviceSub: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "600",
    },
    iotDeviceStateBadge: {
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    iotDeviceStateText: {
        fontSize: 11,
        fontWeight: "700",
    },
    iotStateOn: {
        backgroundColor: "#dcfce7",
    },
    iotStateOff: {
        backgroundColor: "#e2e8f0",
    },
    iotStateOnText: {
        color: "#166534",
    },
    iotStateOffText: {
        color: "#334155",
    },
    videoTourDescription: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "600",
        marginBottom: 2,
    },
    videoTourButton: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#bfdbfe",
        backgroundColor: "#eff6ff",
        minHeight: 42,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    videoTourButtonText: {
        fontSize: 13,
        color: "#1e40af",
        fontWeight: "700",
    },
    videoTourUrlText: {
        marginTop: 4,
        fontSize: 11,
        color: "#64748b",
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
    passwordHint: {
        fontSize: 12,
        color: "#94a3b8",
        fontWeight: "500",
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
