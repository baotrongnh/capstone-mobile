import { paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export type IotControlResponse = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['responses']['201']['content']['application/json']
export type IoTControlRequestBody = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['requestBody']['content']['application/json']
export type IotControlParams = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['parameters']['path']
export type IoTControlVariables = IoTControlRequestBody & IotControlParams

export const iotServices = {
     deviceControl: async ({ espId, deviceId, topic, action }: IoTControlVariables): Promise<IotControlResponse> => {

          const { data } = await apiClient.post(`${endpoints.iot}/devices/${espId}/${deviceId}`, { topic, action })

          return data
     }
}