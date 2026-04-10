import { IoTControlVariables, IotBoardDeviceUpdateVariables, iotServices } from "@/lib/services/iot.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useIotBoards = (apartmentId?: string) => {
     return useQuery({
          queryKey: ["iot-boards", apartmentId],
          queryFn: () => iotServices.getBoards({ apartmentId }),
          enabled: Boolean(apartmentId),
     })
}

export const useDeviceIot = () => {

     return useMutation({
          mutationFn: ({ espId, deviceId, action, topic }: IoTControlVariables) =>
               iotServices.deviceControl({ espId, deviceId, topic, action }),
          onSuccess: () => {
               console.log('ok')
          },
          onError: (error) => {
               console.log(error)
          }
     })
}

export const useUpdateIotBoardDevice = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ boardId, deviceId, payload }: IotBoardDeviceUpdateVariables) =>
               iotServices.updateBoardDevice({ boardId, deviceId, payload }),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["iot-boards"] })
          },
          onError: (error) => {
               console.log(error)
          },
     })
}