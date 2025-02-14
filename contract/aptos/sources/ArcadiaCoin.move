module hero::arcadia_coin {
    use std::signer;
    use aptos_framework::coin::{Self, BurnCapability, MintCapability, FreezeCapability};
    use std::string;

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;

    /// Capabilities for minting and burning tokens
    struct Capabilities has key {
        mint_cap: MintCapability<ArcadiaCoin>,
        burn_cap: BurnCapability<ArcadiaCoin>,
        freeze_cap: FreezeCapability<ArcadiaCoin>,
    }

    /// The Arcadia Coin token
    struct ArcadiaCoin {}

    /// Initialize the module
    public fun initialize(admin: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<ArcadiaCoin>(
            admin,
            string::utf8(b"Arcadia Coin"),
            string::utf8(b"ARC"),
            8,
            true,
        );

        // Store capabilities
        move_to(admin, Capabilities {
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    /// Register account to receive ArcadiaCoin
    public entry fun register(account: &signer) {
        coin::register<ArcadiaCoin>(account);
    }

    /// Mint new tokens
    public entry fun mint(admin: &signer, amount: u64, to: address) acquires Capabilities {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        
        let caps = borrow_global<Capabilities>(@hero);
        let coins = coin::mint(amount, &caps.mint_cap);
        coin::deposit(to, coins);
    }

    /// Burn tokens
    public entry fun burn(admin: &signer, from: &signer, amount: u64) acquires Capabilities {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        
        let caps = borrow_global<Capabilities>(@hero);
        let coins = coin::withdraw<ArcadiaCoin>(from, amount);
        coin::burn(coins, &caps.burn_cap);
    }

    #[test_only]
    public fun initialize_for_test(admin: &signer) {
        initialize(admin);
    }

    #[test_only]
    public fun mint_for_test(admin: &signer, amount: u64, to: address) acquires Capabilities {
        mint(admin, amount, to);
    }

    #[test_only]
    public fun burn_for_test(admin: &signer, from: &signer, amount: u64) acquires Capabilities {
        burn(admin, from, amount);
    }
} 