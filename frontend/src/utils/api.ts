import { AuthControllerApi, ChatControllerApi, Configuration, UserControllerApi } from '../generated/api';
import axiosInstance, { BASE_PATH } from './axios';

class Api {
  auth: AuthControllerApi;

  user: UserControllerApi;

  chat: ChatControllerApi;

  constructor() {
    this.auth = new AuthControllerApi(new Configuration({ basePath: BASE_PATH }), BASE_PATH, axiosInstance);
    this.user = new UserControllerApi(new Configuration({ basePath: BASE_PATH }), BASE_PATH, axiosInstance);
    this.chat = new ChatControllerApi(new Configuration({ basePath: BASE_PATH }), BASE_PATH, axiosInstance);
  }
}

const api = new Api();

export default api;
