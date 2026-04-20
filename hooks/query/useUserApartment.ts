import { getIotBoards, getMyUserApartments, getUserApartmentById, updateDoorPin } from "@/lib/services/userApartment.service"
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

export const useIotBoardsByApartment = (apartmentId?: string) => {
    return useQuery({
        queryKey: ['iot-boards', 'by-apartment', apartmentId],
        queryFn: () => getIotBoards({ apartmentId }),
        enabled: Boolean(apartmentId),
    })
}

export const useUpdateDoorPin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateDoorPin,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['user-apartments'] })
            queryClient.invalidateQueries({ queryKey: ['iot-boards'] })
            console.log(res)
        },
        onError: (error: AxiosError) => {
            console.log(error)
        },
    })
}

export const useUpdateMyHousePassword = useUpdateDoorPin