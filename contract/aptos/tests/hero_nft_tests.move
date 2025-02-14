#[test_only]
module hero_nft::hero_nft_tests {
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::signer;
    use aptos_framework::coin::{Self, BurnCapability, MintCapability};
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use hero_nft::hero_nft;

    const NATIVE_PRICE: u64 = 1000000;
    const TOKEN_PRICE: u64 = 500000;
    const APT_AMOUNT: u64 = 10000000; // 10 APT for testing

    struct TestCapabilities has key {
        mint_cap: MintCapability<AptosCoin>,
        burn_cap: BurnCapability<AptosCoin>
    }

    fun setup_test_coins(framework: &signer, account: &signer) acquires TestCapabilities {
        let account_addr = signer::address_of(account);
        if (!account::exists_at(account_addr)) {
            account::create_account_for_test(account_addr);
        };

        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(framework);
            move_to(framework, TestCapabilities { mint_cap, burn_cap });
        };
        
        if (!coin::is_account_registered<AptosCoin>(account_addr)) {
            coin::register<AptosCoin>(account);
            let caps = borrow_global<TestCapabilities>(@0x1);
            let coins = coin::mint(APT_AMOUNT, &caps.mint_cap);
            coin::deposit(account_addr, coins);
        };
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_initialize(framework: &signer, admin: &signer) {
        // Set up timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        
        // Initialize modules
        hero_nft::initialize(admin);
        
        // Set default prices
        hero_nft::set_default_prices(admin, NATIVE_PRICE, TOKEN_PRICE);
        
        // Register admin's NFT contract
        let admin_addr = signer::address_of(admin);
        hero_nft::register_nft(admin, admin_addr);
        
        // Verify initialization
        assert!(hero_nft::is_registered(admin_addr), 0);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_set_default_prices(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Set new prices
        let new_native_price = 2000000;
        let new_token_price = 1000000;
        hero_nft::set_default_prices(admin, new_native_price, new_token_price);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_set_default_token_type(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Set token type
        let token_type = string::utf8(b"ARC");
        hero_nft::set_default_token_type(admin, token_type);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_set_price_config(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Set price config
        let token_id = 1;
        let token_type = string::utf8(b"ARC");
        let price = 1500000;
        hero_nft::set_price_config(admin, token_id, token_type, price);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_set_apt_price(framework: &signer, admin: &signer) acquires TestCapabilities {
        // Initialize
        test_initialize(framework, admin);
        
        // Setup test coins
        setup_test_coins(framework, admin);
        
        // Set APT price
        let apt_price = 1000000; // 1 APT
        hero_nft::set_default_prices(admin, apt_price, TOKEN_PRICE);
        
        // Verify price
        let price = hero_nft::get_default_native_price();
        assert!(price == apt_price, 0);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_mint_with_apt(framework: &signer, admin: &signer) acquires TestCapabilities {
        // Initialize
        test_initialize(framework, admin);
        
        // Setup test coins
        setup_test_coins(framework, admin);
        
        // Set APT price
        hero_nft::set_default_prices(admin, NATIVE_PRICE, TOKEN_PRICE);
        
        // Create test account
        let user = account::create_account_for_test(@0x123);
        setup_test_coins(framework, &user);
        
        // Register NFT contract
        hero_nft::register_nft(admin, signer::address_of(&user));
        
        // Mint NFT with APT
        let token_id = 1;
        hero_nft::mint_with_native<AptosCoin>(admin, token_id, NATIVE_PRICE);
        
        // Verify NFT ownership
        assert!(hero_nft::token_exists(token_id), 0);
        assert!(hero_nft::owner_of(token_id, signer::address_of(admin)), 1);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_batch_mint_with_apt(framework: &signer, admin: &signer) acquires TestCapabilities {
        // Initialize
        test_initialize(framework, admin);
        
        // Setup test coins
        setup_test_coins(framework, admin);
        
        // Set APT price
        hero_nft::set_default_prices(admin, NATIVE_PRICE, TOKEN_PRICE);
        
        // Create test account
        let user = account::create_account_for_test(@0x123);
        setup_test_coins(framework, &user);
        
        // Register NFT contract
        hero_nft::register_nft(admin, signer::address_of(&user));
        
        // Create token IDs for batch mint
        let token_ids = vector::empty<u64>();
        vector::push_back(&mut token_ids, 1);
        vector::push_back(&mut token_ids, 2);
        
        // Mint NFTs with APT
        hero_nft::mint_batch_with_native<AptosCoin>(admin, token_ids, NATIVE_PRICE * 2);
        
        // Verify NFT ownership
        let admin_addr = signer::address_of(admin);
        assert!(hero_nft::token_exists(1), 0);
        assert!(hero_nft::token_exists(2), 1);
        assert!(hero_nft::owner_of(1, admin_addr), 2);
        assert!(hero_nft::owner_of(2, admin_addr), 3);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    #[expected_failure(abort_code = 65537, location = hero_nft::hero_nft)] // EINVALID_PAYMENT
    public fun test_insufficient_payment(framework: &signer, admin: &signer) acquires TestCapabilities {
        // Initialize
        test_initialize(framework, admin);
        
        // Setup test coins
        setup_test_coins(framework, admin);
        
        // Set APT price
        hero_nft::set_default_prices(admin, NATIVE_PRICE, TOKEN_PRICE);
        
        // Try to mint with insufficient payment
        let token_id = 1;
        hero_nft::mint_with_native<AptosCoin>(admin, token_id, NATIVE_PRICE - 1);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    #[expected_failure(abort_code = 65536, location = hero_nft::hero_nft)] // ENOT_AUTHORIZED
    public fun test_unauthorized_mint(framework: &signer, admin: &signer) acquires TestCapabilities {
        // Initialize
        test_initialize(framework, admin);
        
        // Setup test coins
        setup_test_coins(framework, admin);
        
        // Create unauthorized user
        let user = account::create_account_for_test(@0x123);
        setup_test_coins(framework, &user);
        
        // Try to mint with unauthorized user
        let token_id = 1;
        hero_nft::mint_with_native<AptosCoin>(&user, token_id, NATIVE_PRICE);
    }

    #[test(framework = @0x1, admin = @hero_nft)]
    public fun test_register_nft(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Create test account
        let user = account::create_account_for_test(@0x123);
        
        // Register NFT contract
        hero_nft::register_nft(admin, signer::address_of(&user));
        
        // Verify registration
        assert!(hero_nft::is_registered(signer::address_of(&user)), 0);
    }
}