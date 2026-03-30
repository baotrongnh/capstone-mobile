import { IotControlParams, iotServices } from "@/lib/services/iot.service"
import { useMutation } from "@tanstack/react-query"

export const useDeviceIot = () => {

     return useMutation({
          mutationFn: ({ espId, deviceId, action, deviceType }
               : IotControlParams) =>
               iotServices.deviceControl(espId, deviceId, action, deviceType),
          onSuccess: () => {
               console.log('ok')
          },
          onError: (error) => {
               console.log(error)
          }
     })
}