import { ApartmentHeaderProps } from "@/types/apartment"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

const fallbackSlideWidth = Math.max(Dimensions.get("window").width - 64, 220)

export default function ApartmentHeader({
    apartmentTitle,
    address,
    statusLabel,
    statusBackgroundColor,
    statusTextColor,
    isPrimaryTenant,
    apartmentImages,
}: ApartmentHeaderProps) {
    const validImages = useMemo(
        () =>
            (apartmentImages ?? []).filter(
                (image): image is string => typeof image === "string" && image.trim().length > 0,
            ),
        [apartmentImages],
    )
    const [currentSlide, setCurrentSlide] = useState(0)
    const [galleryWidth, setGalleryWidth] = useState(fallbackSlideWidth)
    const [showGalleryModal, setShowGalleryModal] = useState(false)
    const [focusedImageIndex, setFocusedImageIndex] = useState(0)
    const sliderRef = useRef<ScrollView>(null)

    useEffect(() => {
        if (currentSlide > validImages.length - 1) {
            setCurrentSlide(0)
        }
    }, [currentSlide, validImages.length])

    const onSlideChange = (offsetX: number) => {
        if (!galleryWidth) {
            return
        }

        const nextSlide = Math.round(offsetX / galleryWidth)
        if (nextSlide !== currentSlide) {
            setCurrentSlide(nextSlide)
        }
    }

    const scrollToSlide = (index: number) => {
        if (!validImages.length) {
            return
        }

        const safeIndex = Math.max(0, Math.min(index, validImages.length - 1))
        setCurrentSlide(safeIndex)
        sliderRef.current?.scrollTo({ x: safeIndex * galleryWidth, animated: true })
    }

    const openFocusedImageModal = (index: number) => {
        const safeIndex = Math.max(0, Math.min(index, validImages.length - 1))
        setFocusedImageIndex(safeIndex)
        setShowGalleryModal(true)
    }

    return (
        <>
            <View style={styles.headerCard}>
                <View style={styles.headerIconWrap}>
                    <MaterialCommunityIcons name="home-city-outline" size={24} color="#1d4ed8" />
                </View>

                <View style={styles.headerBody}>
                    <Text style={styles.headerTitle}>Căn hộ của tôi</Text>
                    <Text numberOfLines={1} style={styles.headerApartmentName}>
                        {apartmentTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.headerAddress}>
                        {address}
                    </Text>
                </View>
            </View>

            <View style={styles.badgesContainer}>
                <View style={[styles.badge, { backgroundColor: statusBackgroundColor }]}>
                    <Text style={[styles.badgeText, { color: statusTextColor }]}>{statusLabel}</Text>
                </View>

                <View
                    style={[
                        styles.badge,
                        isPrimaryTenant ? styles.primaryBadge : styles.secondaryBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.badgeText,
                            isPrimaryTenant ? styles.primaryBadgeText : styles.secondaryBadgeText,
                        ]}
                    >
                        {isPrimaryTenant ? "Cư dân chính" : "Cư dân phụ"}
                    </Text>
                </View>
            </View>

            {validImages.length ? (
                <>
                    <View style={styles.galleryCard}>
                        <View style={styles.galleryTopRow}>
                            <Text style={styles.galleryTitle}>Hình ảnh căn hộ</Text>
                            <Text style={styles.galleryCount}>{validImages.length} ảnh</Text>
                        </View>

                        <View
                            style={styles.sliderFrame}
                            onLayout={(event) => setGalleryWidth(event.nativeEvent.layout.width)}
                        >
                            <ScrollView
                                ref={sliderRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(event) =>
                                    onSlideChange(event.nativeEvent.contentOffset.x)
                                }
                            >
                                {validImages.map((imageUri, index) => (
                                    <Pressable
                                        key={`${imageUri}-${index}`}
                                        onPress={() => openFocusedImageModal(index)}
                                    >
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={[styles.apartmentImage, { width: galleryWidth }]}
                                            resizeMode="cover"
                                        />
                                    </Pressable>
                                ))}
                            </ScrollView>

                            {validImages.length > 1 ? (
                                <View style={styles.slideIndicator}>
                                    <Text style={styles.slideIndicatorText}>
                                        {currentSlide + 1}/{validImages.length}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {validImages.length > 1 ? (
                            <ScrollView
                                horizontal
                                style={styles.thumbnailScroll}
                                contentContainerStyle={styles.thumbnailContent}
                                showsHorizontalScrollIndicator={false}
                            >
                                {validImages.map((imageUri, index) => (
                                    <Pressable
                                        key={`${imageUri}-thumb-${index}`}
                                        onPress={() => scrollToSlide(index)}
                                        style={[
                                            styles.thumbnailButton,
                                            currentSlide === index && styles.thumbnailButtonActive,
                                        ]}
                                    >
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.thumbnailImage}
                                            resizeMode="cover"
                                        />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        ) : null}
                    </View>

                    <Modal
                        visible={showGalleryModal}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowGalleryModal(false)}
                    >
                        <View style={styles.modalBackdrop}>
                            <View style={styles.modalCard}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Ảnh căn hộ</Text>
                                    <Pressable
                                        style={styles.modalCloseButton}
                                        onPress={() => setShowGalleryModal(false)}
                                    >
                                        <MaterialCommunityIcons name="close" size={18} color="#0f172a" />
                                    </Pressable>
                                </View>

                                <View style={styles.modalImageWrap}>
                                    <Image
                                        source={{ uri: validImages[focusedImageIndex] }}
                                        style={styles.modalFocusedImage}
                                        resizeMode="contain"
                                    />
                                </View>

                                {validImages.length > 1 ? (
                                    <ScrollView
                                        horizontal
                                        contentContainerStyle={styles.modalThumbList}
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {validImages.map((imageUri, index) => (
                                            <Pressable
                                                key={`${imageUri}-modal-thumb-${index}`}
                                                onPress={() => setFocusedImageIndex(index)}
                                                style={[
                                                    styles.modalThumbButton,
                                                    focusedImageIndex === index && styles.modalThumbButtonActive,
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: imageUri }}
                                                    style={styles.modalThumbImage}
                                                    resizeMode="cover"
                                                />
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                ) : null}
                            </View>
                        </View>
                    </Modal>
                </>
            ) : null}
        </>
    )
}

const styles = StyleSheet.create({
    headerCard: {
        borderRadius: 20,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe5f3",
        padding: 16,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 12,
    },
    headerIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eff6ff",
    },
    headerBody: {
        flex: 1,
        gap: 2,
    },
    headerTitle: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "600",
    },
    headerApartmentName: {
        fontSize: 22,
        color: "#0f172a",
        fontWeight: "800",
    },
    headerAddress: {
        marginTop: 3,
        fontSize: 13,
        color: "#64748b",
    },
    badgesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    primaryBadge: {
        backgroundColor: "#dbeafe",
    },
    secondaryBadge: {
        backgroundColor: "#e5e7eb",
    },
    primaryBadgeText: {
        color: "#1d4ed8",
    },
    secondaryBadgeText: {
        color: "#374151",
    },
    galleryCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#dbe5f3",
        backgroundColor: "#ffffff",
        padding: 12,
        gap: 10,
    },
    galleryTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    galleryTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1e293b",
    },
    galleryCount: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748b",
    },
    sliderFrame: {
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#e2e8f0",
    },
    apartmentImage: {
        height: 220,
        backgroundColor: "#ffffff",
    },
    slideIndicator: {
        position: "absolute",
        right: 10,
        bottom: 10,
        borderRadius: 999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        paddingVertical: 4,
        paddingHorizontal: 9,
    },
    slideIndicatorText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "700",
    },
    thumbnailScroll: {
        maxHeight: 66,
    },
    thumbnailContent: {
        gap: 8,
        paddingRight: 2,
    },
    thumbnailButton: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "transparent",
        overflow: "hidden",
    },
    thumbnailButtonActive: {
        borderColor: "#2563eb",
    },
    thumbnailImage: {
        width: 68,
        height: 56,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.55)",
        justifyContent: "flex-end",
    },
    modalCard: {
        maxHeight: "80%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "#ffffff",
        paddingTop: 12,
        paddingHorizontal: 14,
        paddingBottom: 26,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#0f172a",
    },
    modalCloseButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
    },
    modalImageWrap: {
        width: "100%",
        borderRadius: 14,
        backgroundColor: "#0f172a",
        overflow: "hidden",
    },
    modalFocusedImage: {
        width: "100%",
        height: 360,
    },
    modalThumbList: {
        marginTop: 12,
        paddingBottom: 4,
        flexDirection: "row",
        gap: 8,
    },
    modalThumbButton: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "transparent",
        overflow: "hidden",
    },
    modalThumbButtonActive: {
        borderColor: "#60a5fa",
    },
    modalThumbImage: {
        width: 74,
        height: 58,
    },
})
