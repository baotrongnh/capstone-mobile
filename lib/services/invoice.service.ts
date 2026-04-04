import {
    InvoiceDetailResponse,
    InvoiceListQueryParams,
    InvoiceListResponse,
} from "@/types/invoice"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const invoiceService = {
    getList: async (params?: InvoiceListQueryParams): Promise<InvoiceListResponse> => {
        const { data } = await apiClient.get(endpoints.invoices, { params })
        return data
    },

    getById: async (id: string | number): Promise<InvoiceDetailResponse> => {
        const { data } = await apiClient.get(`${endpoints.invoices}/${id}`)
        return data
    },
}
