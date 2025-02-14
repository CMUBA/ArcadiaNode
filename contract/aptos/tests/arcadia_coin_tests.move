#[test_only]
module hero::arcadia_coin_tests {
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::signer;
    use hero::arcadia_coin::{Self, ArcadiaCoin};

    const USER: address = @0x123;
    const AMOUNT: u64 = 1000000;

    fun setup_admin(admin: &signer) {
        if (!account::exists_at(signer::address_of(admin))) {
            account::create_account_for_test(signer::address_of(admin));
        }
    }

    #[test(admin = @hero)]
    public fun test_initialize(admin: &signer) {
        // Create admin account if it doesn't exist
        setup_admin(admin);
        
        // Initialize ArcadiaCoin
        arcadia_coin::initialize(admin);
        
        // Register admin account
        arcadia_coin::register(admin);
        
        // Mint some coins to admin
        arcadia_coin::mint(admin, AMOUNT, signer::address_of(admin));

        // Verify admin has initial supply
        let admin_balance = coin::balance<ArcadiaCoin>(signer::address_of(admin));
        assert!(admin_balance == AMOUNT, 0);
    }

    #[test(admin = @hero)]
    public fun test_mint(admin: &signer) {
        // Create admin account
        setup_admin(admin);
        
        // Initialize
        test_initialize(admin);
        
        // Create user account
        let user = account::create_account_for_test(USER);
        
        // Register user account
        arcadia_coin::register(&user);
        
        // Mint tokens to user
        arcadia_coin::mint(admin, AMOUNT, USER);
        
        // Verify balance
        let balance = coin::balance<ArcadiaCoin>(USER);
        assert!(balance == AMOUNT, 0);
    }

    #[test(admin = @hero)]
    public fun test_burn(admin: &signer) {
        // Create admin account
        setup_admin(admin);
        
        // Initialize
        test_initialize(admin);
        
        // Create user account
        let user = account::create_account_for_test(USER);
        
        // Register user account
        arcadia_coin::register(&user);
        
        // Mint tokens to user
        arcadia_coin::mint(admin, AMOUNT, USER);
        
        // Burn tokens
        arcadia_coin::burn(admin, &user, AMOUNT);
        
        // Verify balance
        let balance = coin::balance<ArcadiaCoin>(USER);
        assert!(balance == 0, 0);
    }

    #[test(admin = @hero)]
    #[expected_failure(abort_code = 1, location = hero::arcadia_coin)] // ENOT_AUTHORIZED
    public fun test_mint_unauthorized(admin: &signer) {
        // Create admin account
        setup_admin(admin);
        
        // Initialize
        test_initialize(admin);
        
        // Create unauthorized account
        let unauthorized = account::create_account_for_test(@0x456);
        
        // Register unauthorized account
        arcadia_coin::register(&unauthorized);
        
        // Try to mint tokens (should fail)
        arcadia_coin::mint(&unauthorized, AMOUNT, USER);
    }

    #[test(admin = @hero)]
    #[expected_failure(abort_code = 1, location = hero::arcadia_coin)] // ENOT_AUTHORIZED
    public fun test_burn_unauthorized(admin: &signer) {
        // Create admin account
        setup_admin(admin);
        
        // Initialize
        test_initialize(admin);
        
        // Create unauthorized account and user account
        let unauthorized = account::create_account_for_test(@0x456);
        let user = account::create_account_for_test(USER);
        
        // Register accounts
        arcadia_coin::register(&unauthorized);
        arcadia_coin::register(&user);
        
        // Mint tokens to user
        arcadia_coin::mint(admin, AMOUNT, USER);
        
        // Try to burn tokens (should fail)
        arcadia_coin::burn(&unauthorized, &user, AMOUNT);
    }
} 