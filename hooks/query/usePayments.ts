import { paymentService } from "@/lib/services/payment.service"
import {
    CreatePayOSPaymentLinkBody,
    ListPaymentsQuery,
} from "@/types/payment"
import { toPayOSPayloadLog } from "@/utils/payment"
import { useMutation, useQuery } from "@tanstack/react-query"

export const usePayments = (params?: ListPaymentsQuery) => {
    return useQuery({
        queryKey: ["payments", params],
        queryFn: () => paymentService.getPayments(params),
    })
}

export const useCreatePayOSPaymentLink = () => {
    return useMutation({
        mutationFn: (body: CreatePayOSPaymentLinkBody) => paymentService.createPayOSPaymentLink(body),
        onMutate: (body: CreatePayOSPaymentLinkBody) => {
            console.log('[PAYOS] mutation onMutate', toPayOSPayloadLog(body))
        },
        onSuccess: (response, body) => {
            console.log('[PAYOS] mutation onSuccess', {
                request: toPayOSPayloadLog(body),
                paymentId: response?.data?.paymentId,
                paymentReference: response?.data?.paymentReference,
                checkoutUrl: response?.data?.checkoutUrl,
            })
        },
        onError: (errorValue: unknown, body) => {
            console.log('[PAYOS] mutation onError', {
                request: toPayOSPayloadLog(body),
                message: errorValue instanceof Error ? errorValue.message : 'Unknown error',
            })
        },
    })
}
