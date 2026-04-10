import { paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export type IotControlResponse = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['responses']['201']['content']['application/json']
export type IoTControlRequestBody = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['requestBody']['content']['application/json']
export type IotControlParams = paths['/api/v1/iot/devices/{espId}/{deviceId}']['post']['parameters']['path']
export type IoTControlVariables = IoTControlRequestBody & IotControlParams
export type IotBoardsResponse = paths['/api/v1/iot/boards']['get']['responses']['200']['content']['application/json']
export type IotBoardsQueryParams = NonNullable<paths['/api/v1/iot/boards']['get']['parameters']['query']>
export type IotBoardItem = NonNullable<IotBoardsResponse['data']>[number]
export type IotBoardDeviceItem = IotBoardItem['devices'][number]
export type IotBoardDeviceUpdatePathParams = paths['/api/v1/iot/boards/{boardId}/devices/{deviceId}']['patch']['parameters']['path']
export type IotBoardDeviceUpdatePayload = paths['/api/v1/iot/boards/{boardId}/devices/{deviceId}']['patch']['requestBody']['content']['application/json']
export type IotBoardDeviceUpdateResponse = paths['/api/v1/iot/boards/{boardId}/devices/{deviceId}']['patch']['responses']['200']['content']['application/json']
export type IotBoardDeviceUpdateVariables = IotBoardDeviceUpdatePathParams & {
     payload: IotBoardDeviceUpdatePayload
}

export const iotServices = {
     deviceControl: async ({ espId, deviceId, topic, action }: IoTControlVariables): Promise<IotControlResponse> => {

          const { data } = await apiClient.post(`${endpoints.iot}/devices/${espId}/${deviceId}`, { topic, action })

          return data
     },
     getBoards: async (params?: IotBoardsQueryParams): Promise<IotBoardsResponse> => {
          const { data } = await apiClient.get(`${endpoints.iot}/boards`, { params })

          return data
     },
     updateBoardDevice: async ({ boardId, deviceId, payload }: IotBoardDeviceUpdateVariables): Promise<IotBoardDeviceUpdateResponse> => {
          const { data } = await apiClient.patch(`${endpoints.iot}/boards/${boardId}/devices/${deviceId}`, payload)

          return data
     },
}