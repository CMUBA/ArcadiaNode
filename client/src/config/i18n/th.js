export default {
    title: 'Arcadia Node - ระบบนำทาง',
    nodeManagement: 'การจัดการโหนด',
    nodeRegister: 'ลงทะเบียนโหนด',
    healthCheck: 'ตรวจสอบสถานะ',
    serviceManagement: 'การจัดการบริการ',
    serviceDiscovery: 'การลงทะเบียนและค้นหาบริการ',
    userManagement: 'การจัดการผู้ใช้',
    userAuth: 'ลงทะเบียนและเข้าสู่ระบบ',
    chainInteraction: 'ปฏิสัมพันธ์บล็อกเชน',
    heroDataManagement: 'การจัดการข้อมูลฮีโร่',
    contractManagement: 'การจัดการสัญญา',
    contracts: {
        token: 'สัญญาโทเคน',
        stakeManager: 'สัญญาจัดการการวางเดิมพัน',
        nodeRegistry: 'สัญญาลงทะเบียนโหนด',
        hero: {
            nft: 'สัญญา NFT ฮีโร่',
            metadata: 'สัญญาข้อมูลฮีโร่',
            core: 'สัญญาหลักฮีโร่',
            test: 'หน้าทดสอบฮีโร่'
        }
    },
    language: 'ภาษา',
    registeredNodes: 'โหนดที่ลงทะเบียนแล้ว',
    // Node Register Page
    nodeRegisterTitle: 'การลงทะเบียนโหนด',
    registerNewNode: 'ลงทะเบียนโหนดใหม่',
    backToHome: 'กลับสู่หน้าหลัก',
    nodeAddress: 'ที่อยู่โหนด',
    ipOrDomain: 'IP/โดเมน',
    apiServices: 'บริการ API',
    register: 'ลงทะเบียน',
    newNodeInfo: 'ข้อมูลโหนดใหม่',
    nodePrivateKey: 'คีย์ส่วนตัวของโหนด',
    privateKeyWarning: 'กรุณาเก็บรักษาคีย์ส่วนตัวให้ปลอดภัย!',
    enterOrGenerateAddress: 'ป้อนหรือสร้างที่อยู่ใหม่',
    enterOrGenerateKey: 'ป้อนหรือสร้างคีย์ส่วนตัวใหม่',
    ipDomainExample: 'ตัวอย่าง: https://example.com',
    apiExample: 'ตัวอย่าง: [1,2,3,4,5]',
    generateNewKeypair: 'สร้างคู่คีย์ใหม่',
    transferETH: 'โอน ETH',
    transferTokens: 'โอนโทเคน',
    approveTokens: 'อนุมัติโทเคน',
    stakeTokens: 'วางเดิมพันโทเคน',
    getChallenge: '1. รับ Challenge',
    signChallenge: '2. เซ็น Challenge',
    signature: 'ลายเซ็น',
    registrationProcess: 'ขั้นตอนการลงทะเบียน',
    requestResponseInfo: 'ข้อมูลคำขอและการตอบกลับ',
    requestInfo: 'ข้อมูลคำขอ',
    responseInfo: 'ข้อมูลการตอบกลับ',
    // Node Registry Info Page
    nodeRegistryInfoTitle: 'ข้อมูลการลงทะเบียนโหนด',
    queryNodeInfo: 'ค้นหาข้อมูลโหนด',
    enterNodeAddress: 'ป้อนที่อยู่โหนด',
    query: 'ค้นหา',
    contractAddress: 'ที่อยู่สัญญา',
    status: 'สถานะ',
    minStakeAmount: 'จำนวนเงินวางเดิมพันขั้นต่ำ',
    totalNodes: 'จำนวนโหนดทั้งหมด',
    registrationTime: 'เวลาลงทะเบียน',
    active: 'ใช้งาน',
    // Service Management Page
    serviceManageTitle: 'การจัดการบริการ',
    selectNode: 'เลือกโหนด',
    serviceIndex: 'ดัชนีบริการ',
    serviceName: 'ชื่อบริการ',
    serviceUrl: 'URL บริการ',
    serviceDescription: 'คำอธิบาย',
    serviceType: 'ประเภท',
    loading: 'กำลังโหลด...',
    noServices: 'ไม่มีบริการที่ใช้งานได้',
    basic: 'พื้นฐาน',
    extend: 'ขยาย',
    availableServices: 'บริการที่มี',
    hero: {
        test: {
            title: 'ทดสอบระบบฮีโร่',
            wallet: {
                title: 'เชื่อมต่อกระเป๋าเงิน',
                connect: 'เชื่อมต่อกระเป๋าเงิน',
                connected: 'เชื่อมต่อแล้ว'
            },
            race: {
                title: 'ทดสอบข้อมูลเผ่าพันธุ์',
                select: 'เลือกเผ่าพันธุ์'
            },
            class: {
                title: 'ทดสอบข้อมูลอาชีพ',
                select: 'เลือกอาชีพ'
            },
            skill: {
                title: 'ทดสอบข้อมูลทักษะ',
                season: 'เลือกฤดูกาล',
                id: 'รหัสทักษะ',
                level: 'ระดับ'
            },
            creation: {
                title: 'สร้างฮีโร่',
                name: 'ชื่อฮีโร่',
                race: 'เลือกเผ่าพันธุ์',
                class: 'เลือกอาชีพ',
                create: 'สร้างฮีโร่'
            }
        }
    }
}; 