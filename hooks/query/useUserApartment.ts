import { getMyUserApartments, updateMyHousePassword } from "@/lib/services/userApartment.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

export const useUserApartment = () => {
    return useQuery({
        queryKey: ['user-apartments', 'my'],
        queryFn: getMyUserApartments,
    })
}

export const useUpdateMyHousePassword = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateMyHousePassword,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['user-apartments', 'my'] })
            console.log(res)
        },
        onError: (error: AxiosError) => {
            console.log(error)
        },
    })
}