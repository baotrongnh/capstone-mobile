import type { paths } from "@/types/api"

export type ListPaymentsQuery = paths["/api/v1/payments"]["get"]["parameters"]["query"]
export type ListPaymentsRes =
    paths["/api/v1/payments"]["get"]["responses"]["200"]["content"]["application/json"]
export type ListPaymentsPayload = NonNullable<ListPaymentsRes["data"]>
export type PaymentListItem = ListPaymentsPayload extends (infer Item)[] ? Item : never
export type PaymentStatus = Exclude<NonNullable<ListPaymentsQuery>["status"], undefined>

export type CreatePayOSPaymentLinkBody =
    paths["/api/v1/payments/payos/create-link"]["post"]["requestBody"]["content"]["application/json"]
export type CreatePayOSPaymentLinkRes =
    paths["/api/v1/payments/payos/create-link"]["post"]["responses"]["201"]["content"]["application/json"]
export type CreatePayOSPaymentLinkData = NonNullable<CreatePayOSPaymentLinkRes["data"]>
