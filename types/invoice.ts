import type { paths } from "@/types/api"

export type InvoiceListResponse =
    paths["/api/v1/invoices"]["get"]["responses"]["200"]["content"]["application/json"]
export type InvoiceDetailResponse =
    paths["/api/v1/invoices/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
export type InvoiceListQueryParams =
    paths["/api/v1/invoices"]["get"]["parameters"]["query"]
export type InvoiceDetailPathParams =
    paths["/api/v1/invoices/{id}"]["get"]["parameters"]["path"]

export type InvoiceItem = NonNullable<InvoiceListResponse["data"]>[number]
export type InvoiceList = InvoiceItem[]
export type InvoiceQueryParams = NonNullable<InvoiceListQueryParams>
export type InvoiceStatus = NonNullable<InvoiceQueryParams["status"]>
export type InvoiceDetail = NonNullable<InvoiceDetailResponse["data"]>
export type InvoiceDetailId = NonNullable<InvoiceDetailPathParams["id"]>
export type InvoiceDetailPayment = NonNullable<InvoiceDetail["payments"]>[number]
export type InvoiceDetailContentItem =
    NonNullable<NonNullable<InvoiceDetail["invoiceContent"]>["items"]>[number]

export const INVOICE_STATUS_TABS: InvoiceStatus[] = [
    "issued",
    "paid",
    "overdue",
    "cancelled",
]
