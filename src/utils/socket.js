import {io} from 'socket.io-client';
import { BASE_URL } from './constants';


export const CreateSocketConnection = () => {
    if(location.hostname === "localhost") {
        return io(BASE_URL);
    }else{
        return io("/", {path: "/api/socket.io"})
    }
 
}

