import { paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export type lightControlResponse = paths['/api/v1/iot/devices/{espId}/light/{id}']['post']['responses']['200']['content']['application/json']
export type IotControlParams = {
     espId: string,
     deviceId: string,
     action: 'ON' | 'OFF',
     deviceType: 'light' | 'curtain' | 'door' | 'alarm' | string
}

export const iotServices = {
     deviceControl: async (
          espId: IotControlParams['espId'],
          deviceId: IotControlParams['deviceId'],
          action: IotControlParams['action'],
          deviceType: IotControlParams['deviceType']
     ): Promise<lightControlResponse> => {

          const { data } = await apiClient.post(
               `${endpoints.iot}/devices/${espId}/${deviceType}/${deviceId}`,
               { action }
          )

          return data
     }
}