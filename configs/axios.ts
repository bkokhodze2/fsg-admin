import {getAccessToken, removeFromStorage} from "@/services/auth-token.service";
import {authService} from "@/services/auth.service";
import axios, {type CreateAxiosDefaults} from "axios";

const options: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true
}

const axiosClassic = axios.create(options); //for request without auth
const axiosWithAuth = axios.create(options); //for request with auth

axiosWithAuth.interceptors.request.use(config => {
  const accessToken = getAccessToken();

  if (config?.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

axiosWithAuth.interceptors.response.use(
    config => config,
    async error => {
      const originalRequest = error.config;

      if (error?.response.status === 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
          await authService.getNewTokens()
          return axiosWithAuth.request(originalRequest)
        } catch (error) {
          if (error) removeFromStorage()
        }
      }

      throw error;
    }
)

export {axiosClassic, axiosWithAuth}