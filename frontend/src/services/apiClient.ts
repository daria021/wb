import axios, {AxiosInstance} from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE;

export var apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": true
    },
});

function getAccessToken(): string | null {
    return localStorage.getItem("authToken");
}

export function restoreClient() {
    apiClient = axios.create({
        baseURL: BASE_URL,
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": true,
            "Authorization": "Bearer " + getAccessToken(),
        },
    });
}

apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
