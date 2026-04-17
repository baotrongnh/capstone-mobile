"use client"

import { invoiceService } from "@/lib/services/invoice.service"
import {
    InvoiceDetailId,
    InvoiceQueryParams,
    MonthlyUtilityInvoiceQueryParams,
} from "@/types/invoice"
import { useQuery } from "@tanstack/react-query"

export const useInvoices = (params?: InvoiceQueryParams) => {
    return useQuery({
        queryKey: ["invoices", params],
        queryFn: () => invoiceService.getList(params),
    })
}

export const useInvoice = (id?: InvoiceDetailId | null) => {
    return useQuery({
        queryKey: ["invoice-detail", id],
        queryFn: () => {
            if (!id) {
                throw new Error("Invoice id is required")
            }

            return invoiceService.getDetail(id)
        },
        enabled: Boolean(id),
    })
}

export const useUtilityMonthlyInvoices = (params?: MonthlyUtilityInvoiceQueryParams) => {
    return useQuery({
        queryKey: ["utility-monthly-invoices", params],
        queryFn: () => invoiceService.getUtilityMonthly(params),
    })
}
