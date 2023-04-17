import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_BACKEND_BASE_URL_SOCKET ?? 'http://localhost:3002';

export const socket = io(URL);
