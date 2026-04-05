import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";
import { ContractListResponse } from "@/types/contract";

export const contractsService = {
  getList: async (): Promise<ContractListResponse> => {
    const { data } = await apiClient.get<ContractListResponse>(
      endpoints.contracts,
    );

    return data;
  },

  uploadPdf: async (contractId: string, formData: FormData) => {
    const { data } = await apiClient.post(
      `${endpoints.contracts}/${contractId}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },

  cancel: async (contractId: string, reason: string) => {
    const { data } = await apiClient.patch(
      `${endpoints.contracts}/${contractId}/cancel`,
      { reason },
    );
    return data;
  },

  renew: async (
    contractId: string,
    payload: {
      extensionMonths: number;
      specialConditions?: string;
      additionalMembers?: {
        nationalId: string;
        memberType: string;
        isPrimaryContact: boolean;
        sharePercentage: number;
      }[];
    },
  ) => {
    const { data } = await apiClient.post(
      `${endpoints.contracts}/${contractId}/renew`,
      payload,
    );
    return data;
  },

  addMember: async (
    contractId: string,
    payload: {
      nationalId: string;
      memberType: string;
      isPrimaryContact: boolean;
      sharePercentage: number;
    },
  ) => {
    const { data } = await apiClient.post(
      `${endpoints.contracts}/${contractId}/members`,
      payload,
    );
    return data;
  },
};
