"use client"

import { invoiceService } from "@/lib/services/invoice.service"
import { InvoiceQueryParams } from "@/types/invoice"
import { useQuery } from "@tanstack/react-query"

export const useInvoices = (params?: InvoiceQueryParams) => {
    return useQuery({
        queryKey: ["invoices", params],
        queryFn: () => invoiceService.getList(params),
    })
}

export const useInvoice = (id: string | number) => {
    return useQuery({
        queryKey: ["invoices", id],
        queryFn: () => invoiceService.getById(id),
        enabled: !!id,
    })
}
