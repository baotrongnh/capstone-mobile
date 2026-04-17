import {
    InvoiceDetailId,
    InvoiceDetailResponse,
    InvoiceListQueryParams,
    InvoiceListResponse,
    MonthlyUtilityInvoiceQueryParams,
    MonthlyUtilityInvoiceResponse,
} from "@/types/invoice"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const invoiceService = {
    getList: async (params?: InvoiceListQueryParams): Promise<InvoiceListResponse> => {
        const { data } = await apiClient.get(endpoints.invoices, { params })

        return data
    },

    getDetail: async (id: InvoiceDetailId): Promise<InvoiceDetailResponse> => {
        const { data } = await apiClient.get(`${endpoints.invoices}/${id}`)
        return data
    },

    getUtilityMonthly: async (
        params?: MonthlyUtilityInvoiceQueryParams,
    ): Promise<MonthlyUtilityInvoiceResponse> => {
        const { data } = await apiClient.get(`${endpoints.invoices}/utility/monthly`, { params })
        return data
    },
}
