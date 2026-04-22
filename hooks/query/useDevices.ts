import {
     IoTControlVariables,
     IotBoardDeviceUpdateVariables,
     IotDoorHistoryQueryParams,
     IotDoorPinUpdateVariables,
     IotDoorUnlockVariables,
     IotHealthCheckParams,
     IotUtilityMetersQueryParams,
     iotServices,
} from "@/lib/services/iot.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useIotBoards = (apartmentId?: string) => {
     return useQuery({
          queryKey: ["iot-boards", apartmentId],
          queryFn: () => iotServices.getBoards({ apartmentId }),
          enabled: Boolean(apartmentId),
     })
}

export const useIotMeters = (params?: IotUtilityMetersQueryParams) => {
     return useQuery({
          queryKey: ["iot-meter", params?.apartmentId, params?.boardId, params?.status],
          queryFn: () => iotServices.getUtilityMeters(params),
          enabled: Boolean(params?.apartmentId || params?.boardId),
     })
}

export const useDoorHistory = (params?: IotDoorHistoryQueryParams) => {
     return useQuery({
          queryKey: ["iot-door-history", params?.apartmentId, params?.boardId, params?.from, params?.to, params?.limit],
          queryFn: () => iotServices.getDoorHistory(params),
          enabled: Boolean(params?.apartmentId || params?.boardId),
     })
}

export const useDeviceIot = () => {
     return useMutation({
          mutationFn: ({ espId, deviceId, action, topic }: IoTControlVariables) =>
               iotServices.deviceControl({ espId, deviceId, topic, action }),
     })
}

export const useDoorUnlock = () => {
     return useMutation({
          mutationFn: ({ boardId, deviceId, pin }: IotDoorUnlockVariables) =>
               iotServices.unlockDoor({ boardId, deviceId, pin }),
     })
}

export const useUpdateDoorPin = () => {
     return useMutation({
          mutationFn: ({ boardId, deviceId, payload }: IotDoorPinUpdateVariables) =>
               iotServices.updateDoorPin({ boardId, deviceId, payload }),
     })
}

export const useCheckDeviceHealth = () => {
     return useMutation({
          mutationFn: ({ espId }: IotHealthCheckParams) => iotServices.checkDeviceHealth({ espId }),
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
     })
}
