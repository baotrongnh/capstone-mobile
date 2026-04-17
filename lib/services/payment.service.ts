import {
    CreatePayOSPaymentLinkBody,
    CreatePayOSPaymentLinkRes,
    ListPaymentsQuery,
    ListPaymentsRes,
} from "@/types/payment"
import { toPayOSPayloadLog } from "@/utils/payment"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const paymentService = {
    getPayments: async (params?: ListPaymentsQuery): Promise<ListPaymentsRes> => {
        const { data } = await apiClient.get<ListPaymentsRes>(endpoints.payments, { params })
        return data
    },

    createPayOSPaymentLink: async (
        body: CreatePayOSPaymentLinkBody,
    ): Promise<CreatePayOSPaymentLinkRes> => {
        const endpoint = `${endpoints.payments}/payos/create-link`
        const payloadLog = toPayOSPayloadLog(body)

        console.log('[PAYOS] create-link request', {
            endpoint,
            body: payloadLog,
        })

        try {
            const { data } = await apiClient.post<CreatePayOSPaymentLinkRes>(endpoint, body)

            console.log('[PAYOS] create-link response', {
                endpoint,
                paymentId: data?.data?.paymentId,
                paymentReference: data?.data?.paymentReference,
                checkoutUrl: data?.data?.checkoutUrl,
            })

            return data
        } catch (errorValue: unknown) {
            const maybeAxiosError = errorValue as {
                response?: { status?: number; data?: unknown }
            }

            console.log('[PAYOS] create-link error', {
                endpoint,
                body: payloadLog,
                status: maybeAxiosError.response?.status,
                responseData: maybeAxiosError.response?.data,
                message: errorValue instanceof Error ? errorValue.message : 'Unknown error',
            })

            throw errorValue
        }
    },
}
