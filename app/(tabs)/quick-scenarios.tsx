import ApartmentSelector from "@/components/apartment/apartment-selector"
import { QuickScenarioCreateModal, QuickScenarioEditModal } from "@/components/quick-scenarios/scenario-modals"
import { StyledContainer } from "@/components/styles"
import { summarizeScenario, useQuickScenarios } from "@/hooks/quick-scenarios/useQuickScenarios"
import { QUICK_SCENARIO_MAX } from "@/stores/quick-scenario.storage"
import { formatUpdatedAt } from "@/utils/format"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

export default function QuickScenariosTab() {
     const router = useRouter()
     const vm = useQuickScenarios()

     if (!vm.isHydratedStorage || vm.isApartmentLoading) {
          return (
               <StyledContainer style={styles.container}>
                    <View style={styles.loadingWrap}>
                         <ActivityIndicator size="large" color="#2563eb" />
                         <Text style={styles.loadingText}>Đang tải căn hộ...</Text>
                    </View>
               </StyledContainer>
          )
     }

     return (
          <StyledContainer style={styles.container}>
               <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.pageTitle}>Kịch bản nhanh</Text>

                    <ApartmentSelector
                         apartments={vm.myApartments}
                         selectedApartmentId={vm.selectedApartmentId}
                         onSelectApartment={vm.onSelectApartment}
                         onViewApartments={() => router.push("/my-apartments")}
                    />

                    <View style={styles.sectionHeader}>
                         <Text style={styles.sectionTitle}>Danh sách kịch bản</Text>

                         <View style={styles.rightHeaderGroup}>
                              <Text style={styles.countChip}>{vm.scenarios.length}/{QUICK_SCENARIO_MAX}</Text>
                              <Pressable
                                   style={[styles.addButton, vm.scenarios.length >= QUICK_SCENARIO_MAX && styles.addButtonDisabled]}
                                   onPress={vm.openCreateModal}
                                   disabled={vm.scenarios.length >= QUICK_SCENARIO_MAX}
                              >
                                   <MaterialCommunityIcons name="plus" size={16} color="#1d4ed8" />
                                   <Text style={styles.addButtonText}>Tạo mới</Text>
                              </Pressable>
                         </View>
                    </View>

                    {!vm.selectedApartmentId ? (
                         <View style={styles.emptyCard}>
                              <Text style={styles.emptyTitle}>Chưa chọn căn hộ</Text>
                              <Text style={styles.emptyText}>Vui lòng chọn căn hộ để xem kịch bản nhanh.</Text>
                         </View>
                    ) : vm.scenarios.length === 0 ? (
                         <View style={styles.emptyCard}>
                              <Text style={styles.emptyTitle}>Chưa có kịch bản</Text>
                              <Text style={styles.emptyText}>Nhấn Tạo mới để bắt đầu.</Text>
                         </View>
                    ) : (
                         <View style={styles.cardList}>
                              {vm.scenarios.map((scenario) => {
                                   const summary = summarizeScenario(scenario)
                                   const isRunning = vm.runningScenarioId === scenario.id

                                   return (
                                        <Pressable
                                             key={scenario.id}
                                             style={[styles.card, isRunning && styles.cardRunning]}
                                             onPress={() => {
                                                  void vm.runScenario(scenario)
                                             }}
                                             onLongPress={() => vm.openEditModal(scenario)}
                                        >
                                             <View style={styles.cardTopRow}>
                                                  <View style={styles.cardTitleWrap}>
                                                       <View style={styles.cardIconWrap}>
                                                            <MaterialCommunityIcons name="signal-variant" size={24} color="black" />
                                                       </View>

                                                       <View style={styles.cardTextWrap}>
                                                            <Text style={[styles.cardTitle, isRunning && styles.cardTextRunning]} numberOfLines={1}>
                                                                 {scenario.name}
                                                            </Text>
                                                            <Text style={[styles.cardSubtitle, isRunning && styles.cardSubTextRunning]}>
                                                                 {summary.totalDevices} thiết bị • {summary.lightCount} đèn • {summary.curtainCount} rèm
                                                            </Text>
                                                       </View>
                                                  </View>

                                                  <MaterialCommunityIcons
                                                       name="play-circle"
                                                       size={26}
                                                       color={isRunning ? "#ffffff" : "#2563eb"}
                                                  />
                                             </View>

                                             <View style={styles.cardFooter}>
                                                  <Text style={[styles.updatedAtText, isRunning && styles.cardSubTextRunning]}>
                                                       Cập nhật: {formatUpdatedAt(scenario.updatedAt) || "--"}
                                                  </Text>
                                             </View>
                                        </Pressable>
                                   )
                              })}
                         </View>
                    )}

                    {vm.savedAt ? <Text style={styles.savedAt}>Lưu gần nhất: {formatUpdatedAt(vm.savedAt)}</Text> : null}
               </ScrollView>

               <QuickScenarioCreateModal
                    visible={vm.isCreateOpen}
                    isSaving={vm.isCreateSaving}
                    canSubmit={vm.canCreate}
                    name={vm.createName}
                    onChangeName={vm.setCreateName}
                    onClose={vm.closeCreateModal}
                    onSubmit={() => {
                         void vm.submitCreateScenario()
                    }}
                    loadingDevices={vm.isBoardsLoading}
                    totalDevices={vm.scenarioDevices.length}
                    devicesByTopic={vm.devicesByTopic}
                    createByDevice={vm.createByDevice}
                    onChooseOption={vm.onChooseCreateOption}
               />

               <QuickScenarioEditModal
                    visible={vm.isEditOpen}
                    isSaving={vm.isEditSaving}
                    canSave={vm.canSaveEdit}
                    name={vm.editName}
                    onChangeName={vm.setEditName}
                    onClose={vm.closeEditModal}
                    onAfterClose={vm.clearEditModalState}
                    onSave={() => {
                         void vm.submitEditScenario()
                    }}
                    onDelete={vm.confirmDeleteEditingScenario}
                    hiddenItemsCount={vm.hiddenItems.length}
                    devicesByTopic={vm.devicesByTopic}
                    editByDevice={vm.editByDevice}
                    onChooseOption={vm.onChooseEditOption}
               />
          </StyledContainer>
     )
}

const styles = StyleSheet.create({
     container: {
          backgroundColor: "#f3f6fb",
     },
     content: {
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: 130,
          gap: 12,
     },
     pageTitle: {
          fontSize: 21,
          fontWeight: "800",
          color: "#0f172a",
     },
     loadingWrap: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
     },
     loadingText: {
          fontSize: 14,
          color: "#64748b",
          fontWeight: "600",
     },
     sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: "#0f172a",
     },
     rightHeaderGroup: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
     },
     countChip: {
          fontSize: 11,
          color: "#1d4ed8",
          fontWeight: "700",
          borderWidth: 1,
          borderColor: "#bfdbfe",
          borderRadius: 999,
          backgroundColor: "#dbeafe",
          paddingHorizontal: 8,
          paddingVertical: 4,
          minWidth: 34,
          textAlign: "center",
     },
     addButton: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          borderWidth: 1,
          borderColor: "#bfdbfe",
          borderRadius: 999,
          backgroundColor: "#eff6ff",
          paddingHorizontal: 10,
          paddingVertical: 6,
     },
     addButtonDisabled: {
          opacity: 0.5,
     },
     addButtonText: {
          fontSize: 12,
          color: "#1d4ed8",
          fontWeight: "700",
     },
     cardList: {
          gap: 11,
     },
     card: {
          borderRadius: 18,
          padding: 14,
          gap: 10,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#d8e2f0",
          shadowColor: "#0f172a",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
     },
     cardRunning: {
          backgroundColor: "#2563eb",
          borderColor: "#2563eb",
     },
     cardTopRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
     },
     cardTitleWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          flex: 1,
     },
     cardTextWrap: {
          flex: 1,
     },
     cardIconWrap: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e8f0ff",
     },
     cardTitle: {
          fontSize: 15,
          fontWeight: "800",
          color: "#0f172a",
     },
     cardSubtitle: {
          marginTop: 2,
          fontSize: 12,
          color: "#64748b",
          fontWeight: "600",
     },
     cardFooter: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
     },
     updatedAtText: {
          fontSize: 11,
          color: "#94a3b8",
          fontWeight: "600",
     },
     cardTextRunning: {
          color: "#ffffff",
     },
     cardSubTextRunning: {
          color: "#dbeafe",
     },
     emptyCard: {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#dbe3ee",
          borderRadius: 16,
          padding: 14,
          gap: 8,
     },
     emptyTitle: {
          fontSize: 15,
          color: "#111827",
          fontWeight: "700",
     },
     emptyText: {
          fontSize: 13,
          color: "#64748b",
          fontWeight: "500",
     },
     savedAt: {
          fontSize: 12,
          color: "#6b7280",
          textAlign: "right",
     },
})
