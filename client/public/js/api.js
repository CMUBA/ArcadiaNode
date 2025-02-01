export const api = {
    node: {
        getChallenge: () => fetch('/api/v1/node/get-challenge'),
        register: (data) => fetch('/api/v1/node/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }),
        getENS: (address) => fetch('/api/v1/node/ens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        })
    },
    env: {
        get: (key) => fetch('/api/v1/env/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key })
        })
    }
}; 