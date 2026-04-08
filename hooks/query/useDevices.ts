import { IoTControlVariables, iotServices } from "@/lib/services/iot.service"
import { useMutation } from "@tanstack/react-query"

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