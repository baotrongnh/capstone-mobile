import { paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export type lightControlResponse = paths['/api/v1/iot/devices/{espId}/light/{id}']['post']['responses']['200']['content']['application/json']
export type IotControlParams = {
     espId: string,
     deviceId: string,
     action: 'ON' | 'OFF',
     topic: 'light' | 'curtain' | 'door' | 'alarm' | string
}

export const iotServices = {
     deviceControl: async (
          espId: IotControlParams['espId'],
          deviceId: IotControlParams['deviceId'],
          action: IotControlParams['action'],
          topic: IotControlParams['topic']
     ): Promise<lightControlResponse> => {

          const { data } = await apiClient.post(
               `${endpoints.iot}/devices/${espId}/${topic}/${deviceId}`,
               { action }
          )

          return data
     }
}