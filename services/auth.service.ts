'use client'
import {axiosClassic} from "@/configs/axios";
import {removeFromStorage, saveTokenStorage} from "@/services/auth-token.service";

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

      if (token && refresh) {
        await saveTokenStorage(token, refresh)
      }
      return response;

    } catch (e: any) {
      return e.response;
    }


  },
  async getNewTokens() {
    const response = await axiosClassic.post(`auth/refresh`); //albat body unda refreshis
    const {token} = response.data;

    if (token) {
      saveTokenStorage(token)
    }
    return response;
  },
  async logout() {
    const response = await axiosClassic.post('/auth/logout');
    if (response) removeFromStorage();
  }
}