#[test_only]
module hero_nft::hero_nft_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use hero_nft::hero_nft;

    // Test account addresses
    const ADMIN: address = @hero_nft;
    const USER: address = @0x123;

    // Test data
    const NATIVE_PRICE: u64 = 100000000; // 0.1 APT
    const TOKEN_PRICE: u64 = 1000000000; // 1 APT

    #[test(admin = @hero_nft, framework = @0x1)]
    public fun test_initialize(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Create admin account
        account::create_account_for_test(signer::address_of(admin));

        // Initialize contract
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );
    }

    #[test(admin = @hero_nft, user = @0x123, framework = @0x1)]
    public fun test_mint_with_native(admin: &signer, user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(ADMIN);
        account::create_account_for_test(USER);
        
        // Initialize Aptos coin for testing
        let framework_signer = account::create_account_for_test(@0x1);
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&framework_signer);
        
        // Register admin and user for AptosCoin
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(user);
        
        // Give user some APT
        let coins = coin::mint<AptosCoin>(NATIVE_PRICE * 2, &mint_cap);
        coin::deposit(signer::address_of(user), coins);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        // Initialize contract
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // Mint NFT
        hero_nft::mint_with_native<AptosCoin>(
            user,
            1, // token_id
            NATIVE_PRICE,
        );
    }

    #[test(admin = @hero_nft, user = @0x123, framework = @0x1)]
    public fun test_mint_batch_with_native(admin: &signer, user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(ADMIN);
        account::create_account_for_test(USER);
        
        // Initialize Aptos coin for testing
        let framework_signer = account::create_account_for_test(@0x1);
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&framework_signer);
        
        // Register admin and user for AptosCoin
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(user);
        
        // Give user some APT
        let coins = coin::mint<AptosCoin>(NATIVE_PRICE * 4, &mint_cap);
        coin::deposit(signer::address_of(user), coins);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        // Initialize contract
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // Prepare token IDs
        let token_ids = vector::empty<u64>();
        vector::push_back(&mut token_ids, 1);
        vector::push_back(&mut token_ids, 2);
        vector::push_back(&mut token_ids, 3);

        // Batch mint NFTs
        hero_nft::mint_batch_with_native<AptosCoin>(
            user,
            token_ids,
            NATIVE_PRICE * 3,
        );
    }

    #[test(admin = @hero_nft, framework = @0x1)]
    public fun test_set_price_config(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(ADMIN);

        // Initialize contract
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // Set price configuration
        hero_nft::set_price_config(
            admin,
            1, // token_id
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE * 2,
        );
    }

    #[test(user = @0x123, framework = @0x1)]
    #[expected_failure(abort_code = 0, location = hero_nft::hero_nft)]
    public fun test_set_price_config_unauthorized(user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(USER);

        // Unauthorized user attempts to set price
        hero_nft::set_price_config(
            user,
            1,
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
        );
    }

    #[test(admin = @hero_nft, framework = @0x1)]
    public fun test_set_default_prices(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(ADMIN);

        // Initialize contract
        hero_nft::initialize(
            admin,
            string::utf8(b"Hero NFT"),
            string::utf8(b"A collection of hero NFTs"),
            string::utf8(b"https://hero.nft/"),
            string::utf8(b"AptosCoin"),
            NATIVE_PRICE,
            TOKEN_PRICE,
        );

        // Set default prices
        hero_nft::set_default_prices(
            admin,
            NATIVE_PRICE * 2,
            TOKEN_PRICE * 2,
        );
    }

    #[test(user = @0x123, framework = @0x1)]
    #[expected_failure(abort_code = 0, location = hero_nft::hero_nft)]
    public fun test_set_default_prices_unauthorized(user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Setup test environment
        account::create_account_for_test(USER);

        // Unauthorized user attempts to set default prices
        hero_nft::set_default_prices(
            user,
            NATIVE_PRICE,
            TOKEN_PRICE,
        );
    }
} 