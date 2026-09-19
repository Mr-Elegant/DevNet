import {io} from 'socket.io-client';
import { BASE_URL } from './constants';


export const CreateSocketConnection = () => {
    if (BASE_URL.startsWith("http://") || BASE_URL.startsWith("https://")) {
        return io(BASE_URL, {
            withCredentials: true,
        });
    } else {
        return io("/", { path: "/api/socket.io", withCredentials: true });
    }
};

