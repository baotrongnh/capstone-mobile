import { StyledContainer } from "@/components/styles"
import { useUserApartment } from "@/hooks/query/useUserApartment"
import { UserApartmentItem } from "@/types/userApartment"
import {
    extractFirstImage,
    formatAddress,
    formatDate,
    formatTenantStatus,
    getApartmentStatusMeta,
    toDisplayText,
} from "@/utils/userApartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useMemo, useState } from "react"
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"


export default function MyApartmentsPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | string>("all")

    const { data, isLoading, isRefetching, refetch } = useUserApartment()

    const apartments = useMemo<UserApartmentItem[]>(() => {
        return (data?.data as UserApartmentItem[] | undefined) ?? []
    }, [data?.data])

    const statusValues = useMemo(
        () =>
            Array.from(
                new Set(
                    apartments
                        .map((item) => item.apartment?.status)
                        .filter((status): status is string => typeof status === "string" && status.trim().length > 0),
                ),
            ),
        [apartments],
    )

    const stats = useMemo(
        () => ({
            total: apartments.length,
            primaryTenant: apartments.filter((item) => item.isPrimaryTenant).length,
            activeAssignments: apartments.filter((item) => item.status === "active").length,
        }),
        [apartments],
    )

    const filteredApartments = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        return apartments.filter((item) => {
            const apartment = item.apartment
            const searchText = [apartment?.buildingName, apartment?.apartmentNumber, apartment?.streetAddress]
                .filter((value): value is string => typeof value === "string")
                .join(" ")
                .toLowerCase()

            const matchSearch = keyword.length === 0 || searchText.includes(keyword)
            const matchStatus = statusFilter === "all" || apartment?.status === statusFilter

            return matchSearch && matchStatus
        })
    }, [apartments, search, statusFilter])

    if (isLoading) {
        return (
            <StyledContainer style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.centerText}>Đang tải danh sách căn hộ...</Text>
                </View>
            </StyledContainer>
        )
    }

    return (
        <StyledContainer style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3b82f6" />}
            >
                <View style={styles.headerCard}>
                    <Text style={styles.headerTitle}>Căn hộ của tôi</Text>
                    <Text style={styles.headerSubtitle}>Danh sách căn hộ bạn đang được gán</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Tổng căn hộ</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.primaryTenant}</Text>
                        <Text style={styles.statLabel}>Cư dân chính</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.activeAssignments}</Text>
                        <Text style={styles.statLabel}>Đang hiệu lực</Text>
                    </View>
                </View>

                <View style={styles.searchWrap}>
                    <MaterialCommunityIcons name="magnify" size={18} color="#64748b" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Tìm theo tòa nhà, số căn, địa chỉ..."
                        placeholderTextColor="#94a3b8"
                        style={styles.searchInput}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    <Pressable
                        style={[styles.filterChip, statusFilter === "all" && styles.filterChipActive]}
                        onPress={() => setStatusFilter("all")}
                    >
                        <Text style={[styles.filterChipText, statusFilter === "all" && styles.filterChipTextActive]}>
                            Tất cả
                        </Text>
                    </Pressable>

                    {statusValues.map((status) => {
                        const statusMeta = getApartmentStatusMeta(status)
                        const active = statusFilter === status

                        return (
                            <Pressable
                                key={status}
                                style={[
                                    styles.filterChip,
                                    active && styles.filterChipActive,
                                    { borderColor: active ? statusMeta.textColor : "#dbe5f3" },
                                ]}
                                onPress={() => setStatusFilter(status)}
                            >
                                <Text style={[styles.filterChipText, active && { color: statusMeta.textColor }]}>
                                    {statusMeta.label}
                                </Text>
                            </Pressable>
                        )
                    })}
                </ScrollView>

                {filteredApartments.length > 0 ? (
                    filteredApartments.map((item) => {
                        const apartment = item.apartment
                        const statusMeta = getApartmentStatusMeta(apartment?.status)
                        const firstCoverImage = extractFirstImage(apartment?.images)

                        return (
                            <Pressable
                                key={item.id}
                                style={styles.apartmentCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/my-apartment-detail",
                                        params: { id: String(item.id) },
                                    })
                                }
                            >
                                {firstCoverImage ? (
                                    <Image
                                        source={{ uri: firstCoverImage }}
                                        resizeMode="cover"
                                        style={styles.coverImage}
                                    />
                                ) : (
                                    <View style={styles.coverPlaceholder}>
                                        <MaterialCommunityIcons name="home-city-outline" size={34} color="#94a3b8" />
                                    </View>
                                )}

                                <View style={styles.apartmentBody}>
                                    <View style={styles.apartmentHead}>
                                        <View style={styles.apartmentTitleWrap}>
                                            <Text numberOfLines={1} style={styles.apartmentName}>
                                                {toDisplayText(apartment?.buildingName, "Căn hộ của tôi")}
                                            </Text>
                                            <Text style={styles.apartmentSubName}>Căn {toDisplayText(apartment?.apartmentNumber)}</Text>
                                        </View>

                                        <View style={[styles.statusBadge, { backgroundColor: statusMeta.backgroundColor }]}>
                                            <Text style={[styles.statusBadgeText, { color: statusMeta.textColor }]}>{statusMeta.label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={16} color="#64748b" />
                                        <Text numberOfLines={2} style={styles.infoText}>
                                            {formatAddress(apartment?.streetAddress, apartment?.wardCode, apartment?.provinceCode)}
                                        </Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="account-outline" size={16} color="#64748b" />
                                        <Text style={styles.infoText}>
                                            {item.isPrimaryTenant ? "Cư dân chính" : "Cư dân phụ"} - {formatTenantStatus(item.status)}
                                        </Text>
                                    </View>

                                    <View style={styles.timelineRow}>
                                        <Text style={styles.timelineText}>Vào ở: {formatDate(item.moveInDate)}</Text>
                                        <Text style={styles.timelineText}>Rời đi: {formatDate(item.moveOutDate)}</Text>
                                    </View>

                                    <View style={styles.viewDetailRow}>
                                        <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={18} color="#2563eb" />
                                    </View>
                                </View>
                            </Pressable>
                        )
                    })
                ) : (
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="home-search-outline" size={44} color="#94a3b8" />
                        <Text style={styles.emptyTitle}>
                            {apartments.length === 0 ? "Bạn chưa được gán căn hộ nào" : "Không có căn hộ phù hợp"}
                        </Text>
                        <Text style={styles.emptyText}>
                            {apartments.length === 0
                                ? "Vui lòng liên hệ ban quản lý để cập nhật thông tin căn hộ."
                                : "Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </StyledContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f3f5f9",
        paddingHorizontal: 18,
    },
    content: {
        gap: 12,
        paddingBottom: 130,
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
    headerCard: {
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe5f3",
        padding: 16,
        gap: 4,
    },
    headerTitle: {
        fontSize: 22,
        color: "#0f172a",
        fontWeight: "800",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "500",
    },
    statsRow: {
        flexDirection: "row",
        gap: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: 14,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe5f3",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0f172a",
    },
    statLabel: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "600",
        marginTop: 2,
        textAlign: "center",
    },
    searchWrap: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dbe5f3",
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        minHeight: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#0f172a",
    },
    filterRow: {
        gap: 8,
        paddingRight: 6,
    },
    filterChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#dbe5f3",
        backgroundColor: "#ffffff",
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    filterChipActive: {
        backgroundColor: "#eff6ff",
        borderColor: "#93c5fd",
    },
    filterChipText: {
        fontSize: 12,
        color: "#334155",
        fontWeight: "700",
    },
    filterChipTextActive: {
        color: "#1d4ed8",
    },
    apartmentCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#dbe5f3",
        backgroundColor: "#ffffff",
        overflow: "hidden",
    },
    coverImage: {
        width: "100%",
        height: 140,
        backgroundColor: "#e2e8f0",
    },
    coverPlaceholder: {
        width: "100%",
        height: 140,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    apartmentBody: {
        padding: 14,
        gap: 10,
    },
    apartmentHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    apartmentTitleWrap: {
        flex: 1,
        gap: 2,
    },
    apartmentName: {
        fontSize: 16,
        color: "#0f172a",
        fontWeight: "800",
    },
    apartmentSubName: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    statusBadge: {
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#334155",
        lineHeight: 18,
    },
    timelineRow: {
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 8,
        gap: 2,
    },
    timelineText: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    viewDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 2,
    },
    viewDetailText: {
        fontSize: 13,
        color: "#2563eb",
        fontWeight: "700",
    },
    emptyCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        backgroundColor: "#f8fafc",
        padding: 20,
        alignItems: "center",
        gap: 8,
    },
    emptyTitle: {
        fontSize: 15,
        color: "#1e293b",
        fontWeight: "800",
        textAlign: "center",
    },
    emptyText: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 20,
    },
})
