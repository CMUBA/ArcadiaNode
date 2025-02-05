export default {
    title: 'Arcadia Node - Service Navigation',
    nodeManagement: 'Node Management',
    nodeRegister: 'Node Register',
    healthCheck: 'Health Check',
    serviceManagement: 'Service Management',
    serviceDiscovery: 'Service Registration & Discovery',
    userManagement: 'User Management',
    userAuth: 'User Registration & Login',
    chainInteraction: 'Chain Interaction',
    heroDataManagement: 'Hero Data Management',
    contractManagement: 'Contract Management',
    contracts: {
        token: 'Token Contract',
        stakeManager: 'Stake Manager Contract',
        nodeRegistry: 'Node Registry Contract',
        hero: {
            nft: 'Hero NFT Contract',
            metadata: 'Hero Metadata Contract',
            core: 'Hero Core Contract'
        }
    },
    language: 'Language',
    qa: {
        title: "Q&A",
        readMore: "Read More",
        readLess: "Read Less",
        viewAll: "View All Questions",
        questions: [
            {
                title: "What is ArcadiaNode?",
                content: "ArcadiaNode is a decentralized service platform that allows users to provide and consume various computing services in a trustless manner. It leverages blockchain technology and IPFS to ensure data integrity and service availability."
            },
            {
                title: "How to become a service provider?",
                content: "To become a service provider, you need to: 1) Register your node with a valid ETH address 2) Deploy your service following our plugin specifications 3) Pass the health check 4) Start serving requests from users. The entire process is permissionless and decentralized."
            },
            {
                title: "What types of services can I provide?",
                content: "You can provide any type of computing service that follows our plugin specification. Common examples include: data storage, computation, API endpoints, content delivery, etc. The platform is designed to be extensible and can accommodate various types of services."
            }
        ]
    },
    registeredNodes: 'Registered Nodes',
    // Node Register Page
    nodeRegisterTitle: 'Node Registration',
    registerNewNode: 'Register New Node',
    backToHome: 'Back to Home',
    nodeAddress: 'Node Address',
    ipOrDomain: 'IP/Domain',
    apiServices: 'API Services',
    register: 'Register',
    newNodeInfo: 'New Node Information',
    nodePrivateKey: 'Node Private Key',
    privateKeyWarning: 'Please keep your private key safe!',
    enterOrGenerateAddress: 'Enter or generate new address',
    enterOrGenerateKey: 'Enter or generate new private key',
    ipDomainExample: 'Example: https://example.com',
    apiExample: 'Example: [1,2,3,4,5]',
    generateNewKeypair: 'Generate New Keypair',
    transferETH: 'Transfer ETH',
    transferTokens: 'Transfer Tokens',
    approveTokens: 'Approve Tokens',
    stakeTokens: 'Stake Tokens',
    getChallenge: '1. Get Challenge',
    signChallenge: '2. Sign Challenge',
    signature: 'Signature',
    registrationProcess: 'Registration Process',
    requestResponseInfo: 'Request and Response Info',
    requestInfo: 'Request Info',
    responseInfo: 'Response Info',
    // Node Registry Info Page
    nodeRegistryInfoTitle: 'Node Registry Information',
    queryNodeInfo: 'Query Node Info',
    enterNodeAddress: 'Enter node address',
    query: 'Query',
    contractAddress: 'Contract Address',
    status: 'Status',
    minStakeAmount: 'Minimum Stake Amount',
    totalNodes: 'Total Nodes',
    registrationTime: 'Registration Time',
    active: 'Active',
    // Service Management Page
    serviceManageTitle: 'Service Management',
    selectNode: 'Select Node',
    serviceIndex: 'Service Index',
    serviceName: 'Service Name',
    serviceUrl: 'Service URL',
    serviceDescription: 'Description',
    serviceType: 'Type',
    loading: 'Loading...',
    noServices: 'No services available',
    basic: 'Basic',
    extend: 'Extended'
}; 