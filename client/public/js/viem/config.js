import { createPublicClient, createWalletClient, http, optimismSepolia } from 'viem';

export const publicClient = createPublicClient({
    chain: optimismSepolia,
    transport: http()
});

export const createWallet = (privateKey) => {
    return createWalletClient({
        chain: optimismSepolia,
        transport: http(),
        account: privateKey
    });
}; 