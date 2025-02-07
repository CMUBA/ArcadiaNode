#[test_only]
module hero_nft::hero_nft_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::type_info;
    use hero_nft::hero_nft;

    // 测试账户地址
    const ADMIN: address = @hero_nft;
    const USER: address = @0x123;

    // 测试数据
    const NATIVE_PRICE: u64 = 100000000; // 0.1 APT
    const TOKEN_PRICE: u64 = 1000000000; // 1 APT

    #[test(admin = @hero_nft, user = @0x123)]
    public fun test_initialize(admin: &signer) {
        // 创建管理员账户
        account::create_account_for_test(signer::address_of(admin));

        // 初始化合约
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    public fun test_mint_with_native(admin: &signer, user: &signer) {
        // 设置测试环境
        account::create_account_for_test(ADMIN);
        account::create_account_for_test(USER);
        
        // 给用户一些APT
        coin::register<AptosCoin>(user);
        let amount = NATIVE_PRICE * 2;
        coin::deposit(USER, coin::mint<AptosCoin>(amount));

        // 初始化合约
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // 铸造NFT
        hero_nft::mint_with_native<AptosCoin>(
            user,
            1, // token_id
            NATIVE_PRICE,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    public fun test_mint_batch_with_native(admin: &signer, user: &signer) {
        // 设置测试环境
        account::create_account_for_test(ADMIN);
        account::create_account_for_test(USER);
        
        // 给用户一些APT
        coin::register<AptosCoin>(user);
        let amount = NATIVE_PRICE * 4;
        coin::deposit(USER, coin::mint<AptosCoin>(amount));

        // 初始化合约
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // 准备token IDs
        let token_ids = vector::empty<u64>();
        vector::push_back(&mut token_ids, 1);
        vector::push_back(&mut token_ids, 2);
        vector::push_back(&mut token_ids, 3);

        // 批量铸造NFT
        hero_nft::mint_batch_with_native<AptosCoin>(
            user,
            token_ids,
            NATIVE_PRICE * 3,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    public fun test_set_price_config(admin: &signer) {
        // 设置测试环境
        account::create_account_for_test(ADMIN);

        // 初始化合约
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // 设置价格配置
        hero_nft::set_price_config(
            admin,
            1, // token_id
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE * 2,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    #[expected_failure(abort_code = 0)]
    public fun test_set_price_config_unauthorized(user: &signer) {
        // 设置测试环境
        account::create_account_for_test(USER);

        // 未授权用户尝试设置价格
        hero_nft::set_price_config(
            user,
            1,
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    public fun test_set_default_prices(admin: &signer) {
        // 设置测试环境
        account::create_account_for_test(ADMIN);

        // 初始化合约
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            type_info::type_of<AptosCoin>(),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // 设置默认价格
        hero_nft::set_default_prices(
            admin,
            NATIVE_PRICE * 2,
            TOKEN_PRICE * 2,
        );
    }

    #[test(admin = @hero_nft, user = @0x123)]
    #[expected_failure(abort_code = 0)]
    public fun test_set_default_prices_unauthorized(user: &signer) {
        // 设置测试环境
        account::create_account_for_test(USER);

        // 未授权用户尝试设置默认价格
        hero_nft::set_default_prices(
            user,
            NATIVE_PRICE,
            TOKEN_PRICE,
        );
    }
} 