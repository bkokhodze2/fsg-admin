'use client'
import {axiosClassic, axiosWithAuth} from "@/configs/axios";
import {geRefreshToken, removeFromStorage, saveTokenStorage} from "@/services/auth-token.service";

interface IAuthResponse {
  "message": "string",
  "token": "string",
  "refresh": "string"
}

export const authService = {
  async login(type: 'login', data: IAuthForm) {

    try {
      const response = await axiosClassic.post<IAuthResponse>(`auth/login`, data);
      const {token, refresh} = response.data;

      console.log("savetoken",token,refresh)

      if (token && refresh) {
        await saveTokenStorage(token, refresh)
      }
      return response;

    } catch (e: any) {
      return e.response;
    }


  },
  async getNewTokens() {
    const refreshTokenData = geRefreshToken()

    const response = await axiosClassic.post(`/auth/refresh-token`, {refreshToken: refreshTokenData}); //albat body unda refreshis
    const newAccessToken = response.data;

    if (newAccessToken) {
      console.log("newAccessToken",newAccessToken)
      saveTokenStorage(newAccessToken)
    }
    return response;
  },
  async logout() {
    const response = await axiosWithAuth.post('/user/logout');
    if (response) removeFromStorage();
  }
}