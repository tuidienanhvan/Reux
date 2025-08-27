//src/lib/axios.js

import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "/api",
    withCredentials: true
})