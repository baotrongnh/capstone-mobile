import {
  ApartmentDetailResponse,
  ApartmentListResponse,
  ApartmentSearchQueryParams,
} from "../../types/apartment"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const apartmentService = {
  getList: async (params?: ApartmentSearchQueryParams): Promise<ApartmentListResponse> => {
    const { data } = await apiClient.get(`${endpoints.apartments}/search`, {
      params,
    })
    return data
  },

  getById: async (id: string | number): Promise<ApartmentDetailResponse> => {
    const { data } = await apiClient.get(`${endpoints.apartments}/${id}`)
    return data
  },

  create: async (apartmentData: string) => {
    const { data } = await apiClient.post(endpoints.apartments, apartmentData)
    return data
  },

  update: async (id: string | number, apartmentData: string) => {
    const { data } = await apiClient.put(
      `${endpoints.apartments}/${id}`,
      apartmentData,
    );
    return data
  },

  delete: async (id: string | number) => {
    const { data } = await apiClient.delete(`${endpoints.apartments}/${id}`)
    return data
  },
}
