import { paths } from "@/types/api";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export type MaintenanceRequest =
  paths["/api/v1/maintenance/history"]["get"]["responses"]["200"]["content"]["application/json"];

export const maintenanceService = {
  createRequest: async (requestData: any) => {
    const { data } = await apiClient.post(
      `${endpoints.maintenance}`,
      requestData,
    );
    return data;
  },
  getMaintenanceHistory: async () => {
    const { data } = await apiClient.get<MaintenanceRequest[]>(
      `${endpoints.maintenance}/history`,
    );
    return data;
  },
  rateRequest: async (requestId: string, body: object) => {
    const { data } = await apiClient.patch(
      `${endpoints.maintenance}/${requestId}/rate`,
      body,
    );
    return data;
  },
};
