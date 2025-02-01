// API configuration
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || '3017';
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api/v1`;

export const api = {
    node: {
        getChallenge: () => fetch(`${API_BASE_URL}/node/get-challenge`),
        register: (data) => fetch(`${API_BASE_URL}/node/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    }
}; 