import { IotControlParams, iotServices } from "@/lib/services/iot.service"
import { useMutation } from "@tanstack/react-query"

export const useDeviceIot = () => {

     return useMutation({
          mutationFn: ({ espId, deviceId, action, topic }
               : IotControlParams) =>
               iotServices.deviceControl(espId, deviceId, action, topic),
          onSuccess: () => {
               console.log('ok')
          },
          onError: (error) => {
               console.log(error)
          }
     })
}