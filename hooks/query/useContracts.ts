import { contractsService } from "@/lib/services/contract.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useContracts = () =>
  useQuery({
    queryKey: ["contracts"],
    queryFn: contractsService.getList,
  });

export const useUploadContractPdf = (contractId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      contractsService.uploadPdf(contractId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      Alert.alert(
        "Thành công",
        "Gửi hợp đồng thành công! Vui lòng thanh toán để hoàn tất thủ tục.",
      );
    },
    onError: (error) => {
      console.error("Error uploading PDF:", error);
      Alert.alert("Lỗi", "Lỗi khi gửi hợp đồng");
    },
  });
};

export const useCancelContract = (contractId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => contractsService.cancel(contractId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      Alert.alert("Thành công", "Hợp đồng hủy thành công!");
    },
    onError: (error) => {
      console.error("Error canceling contract:", error);
      Alert.alert("Lỗi", "Lỗi khi hủy hợp đồng");
    },
  });
};

export const useRenewContract = (contractId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => contractsService.renew(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      Alert.alert("Thành công", "Gia hạn hợp đồng thành công!");
    },
    onError: (error: any) => {
      console.error("Error renewing contract:", error);
      const message =
        error?.response?.data?.message || "Lỗi khi gia hạn hợp đồng";
      Alert.alert("Lỗi", message);
    },
  });
};

export const useAddMemberContract = (contractId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      contractsService.addMember(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      Alert.alert("Thành công", "Thêm thành viên vào hợp đồng thành công!");
    },
    onError: (error: any) => {
      console.error("Error adding member to contract:", error);
      const message = error?.response?.data?.message || "Có lỗi xảy ra";
      Alert.alert("Lỗi", message);
    },
  });
};
