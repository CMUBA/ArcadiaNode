import config from '../config/index.js';

const api = {
    node: {
        getChallenge: () => fetch(`${config.SERVER_API_URL}/node/get-challenge`),
        register: (data) => fetch(`${config.SERVER_API_URL}/node/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }),
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