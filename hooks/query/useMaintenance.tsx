import { maintenanceService } from "@/lib/services/maintenance.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceService.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceHistory"] });
      Alert.alert("Thành công", "Yêu cầu bảo trì đã được gửi!");
    },
    onError: (error) => {
      Alert.alert("Lỗi", error?.message || "Có lỗi xảy ra!");
    },
  });
};

export const useGetMaintenanceRequests = () => {
  return useQuery({
    queryKey: ["maintenanceHistory"],
    queryFn: () => maintenanceService.getMaintenanceHistory(),
  });
};

export const useRateMaintenanceRequest = (requestId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: object) =>
      maintenanceService.rateRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceHistory"] });
      Alert.alert("Cảm ơn!", "Đánh giá của bạn đã được gửi!");
    },
    onError: (error) => {
      Alert.alert("Lỗi", error?.message || "Có lỗi xảy ra khi gửi đánh giá!");
    },
  });
};
