// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3017';

export const api = {
    node: {
        getChallenge: () => fetch(`${API_BASE_URL}/api/v1/node/get-challenge`),
        register: (data) => fetch(`${API_BASE_URL}/api/v1/node/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    }
}; 