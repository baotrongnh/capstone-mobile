import axios from "axios"

const baseURL = process.env.EXPO_PUBLIC_ESP_IP

if (!baseURL) {
     throw new Error("EXPO_PUBLIC_ESP_IP is not defined")
}

export const espClient = axios.create({
     baseURL,
     timeout: 10000,
})
