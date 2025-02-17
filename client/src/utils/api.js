import config from '../config/index.js';

const api = {
    node: {
        getChallenge: () => fetch(`${config.SERVER_API_URL}/node/get-challenge`),
        queryNode: (address) => fetch(`${config.SERVER_API_URL}/node/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        }),
        register: async (data) => {
            try {
                const response = await fetch(`${config.SERVER_API_URL}/node/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                console.log('Response:', response);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                return response.json();
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('Request timed out');
                } else {
                    console.error('Registration error:', error);
                }
                throw error;
            }
        },
        getENS: (address) => fetch(`${config.SERVER_API_URL}/node/ens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        })
    }
};

export default api; 