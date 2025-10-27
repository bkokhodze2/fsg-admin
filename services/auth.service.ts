"use client";
import { axiosClassic, axiosWithAuth } from "@/configs/axios";
import {
  geRefreshToken,
  removeFromStorage,
  saveTokenStorage,
} from "@/services/auth-token.service";

interface IAuthResponse {
  message: "string";
  token: "string";
  refresh_token: "string";
}

export const authService = {
  async login(type: "login", data: IAuthForm) {
    try {
      const response = await axiosClassic.post<IAuthResponse>(
        `/auth/login`,
        data
      );
      const { token, refresh_token } = response.data;

      if (token && refresh_token) {
        await saveTokenStorage(token, refresh_token);
      }
      return response;
    } catch (e: any) {
      return e.response;
    }
  },
  async getNewTokens() {
    console.log("getNewTokens");
    const refreshTokenData = geRefreshToken();

    const response = await axiosClassic.post(`/auth/refresh`, {
      refreshToken: refreshTokenData,
    }); //albat body unda refreshis
    const newAccessToken = response.data;

    if (newAccessToken) {
      console.log("newAccessToken", newAccessToken);
      saveTokenStorage(newAccessToken);
    }
    return response;
  },
  async logout() {
    const response = await axiosWithAuth.post("/auth/logout", {
      refreshToken: geRefreshToken(),
    });
    removeFromStorage();
  },
};
