const SERVER_API_URL = process.env.SERVER_API_URL || 'http://localhost:3007/api/v1';
const SERVERX_API_URL = process.env.SERVERX_API_URL || 'http://localhost:3009/api/v1';

const api = {
    node: {
        getChallenge: () => fetch(`${SERVER_API_URL}/node/get-challenge`),
        register: (data) => fetch(`${SERVER_API_URL}/node/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }),
        getENS: (address) => fetch(`${SERVER_API_URL}/node/ens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        })
    },
    env: {
        get: (key) => fetch(`${SERVER_API_URL}/env/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key })
        })
    }
};

module.exports = api; 