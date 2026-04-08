import type { paths } from "@/types/api"

export type InvoiceListResponse =
    paths["/api/v1/invoices"]["get"]["responses"]["200"]["content"]["application/json"]
export type InvoiceDetailResponse =
    paths["/api/v1/invoices/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
export type InvoiceListQueryParams =
    paths["/api/v1/invoices"]["get"]["parameters"]["query"]

export type InvoiceItem = NonNullable<InvoiceListResponse["data"]>[number]
export type InvoiceList = InvoiceItem[]
export type InvoiceQueryParams = NonNullable<InvoiceListQueryParams>
export type InvoiceStatus = NonNullable<InvoiceQueryParams["status"]>

export const INVOICE_STATUS_TABS: InvoiceStatus[] = [
    "issued",
    "paid",
    "overdue",
    "cancelled",
]
