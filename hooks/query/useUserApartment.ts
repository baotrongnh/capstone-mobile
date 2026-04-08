import { getMyUserApartments, getUserApartmentById, updateMyHousePassword } from "@/lib/services/userApartment.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

export const useUserApartment = () => {
    return useQuery({
        queryKey: ['user-apartments', 'my'],
        queryFn: getMyUserApartments,
    })
}

export const useUserApartmentDetail = (id: string) => {
    return useQuery({
        queryKey: ['user-apartments', 'detail', id],
        queryFn: () => getUserApartmentById(id),
        enabled: Boolean(id),
    })
}

export const useUpdateMyHousePassword = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateMyHousePassword,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['user-apartments'] })
            console.log(res)
        },
        onError: (error: AxiosError) => {
            console.log(error)
        },
    })
}