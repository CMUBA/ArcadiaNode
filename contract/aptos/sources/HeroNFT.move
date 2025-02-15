module hero_nft::hero_nft {
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::signer;
    use aptos_token::token;
    use aptos_framework::type_info;

    // Error codes
    const ENOT_AUTHORIZED: u64 = 65536;
    const EINVALID_PAYMENT: u64 = 65537;
    const ETOKEN_NOT_FOUND: u64 = 65538;
    const EINVALID_TOKEN_ID: u64 = 65539;

    // Collection data structure
    struct CollectionData has key {
        admin: address,
        default_native_price: u64,
        default_token_price: u64,
        default_token_type: String,
        price_configs: vector<PriceConfig>,
        registered_nfts: vector<address>,
    }

    // Price configuration for tokens
    struct PriceConfig has store {
        token_type: String,
        price: u64,
        is_active: bool,
    }

    // Events
    #[event]
    struct NFTMintedEvent has drop, store {
        to: address,
        token_id: u64,
        payment_token: String,
        price: u64,
        timestamp: u64,
    }

    #[event]
    struct PriceConfigUpdatedEvent has drop, store {
        token_id: u64,
        token_type: String,
        price: u64,
        timestamp: u64,
    }

    #[event]
    struct NFTRegisteredEvent has drop, store {
        nft_contract: address,
        timestamp: u64,
    }

    // Initialize collection
    public entry fun initialize(account: &signer) {
        let admin = signer::address_of(account);
        
        move_to(account, CollectionData {
            admin,
            default_native_price: 1000000, // 1 APT
            default_token_price: 1000000,  // 1 Token
            default_token_type: string::utf8(b""),
            price_configs: vector::empty(),
            registered_nfts: vector::empty(),
        });
    }

    // Register NFT contract
    public entry fun register_nft(account: &signer, nft_contract: address) acquires CollectionData {
        let collection_data = borrow_global_mut<CollectionData>(@hero_nft);
        assert!(signer::address_of(account) == collection_data.admin, ENOT_AUTHORIZED);
        
        vector::push_back(&mut collection_data.registered_nfts, nft_contract);
        
        event::emit(NFTRegisteredEvent {
            nft_contract,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Get registered NFTs
    public fun get_registered_nfts(): vector<address> acquires CollectionData {
        let collection_data = borrow_global<CollectionData>(@hero_nft);
        *&collection_data.registered_nfts
    }

    // Check if NFT contract is registered
    public fun is_registered(nft_contract: address): bool acquires CollectionData {
        let collection_data = borrow_global<CollectionData>(@hero_nft);
        vector::contains(&collection_data.registered_nfts, &nft_contract)
    }

    // Get price for token
    public fun get_price_for_token(token_id: u64, collection_data: &CollectionData): u64 {
        let i = 0;
        while (i < vector::length(&collection_data.price_configs)) {
            let config = vector::borrow(&collection_data.price_configs, i);
            if (token_id == i && config.is_active) {
                return config.price
            };
            i = i + 1;
        };
        collection_data.default_native_price
    }

    // Get total price for batch of tokens
    public fun get_total_price_for_tokens(token_ids: &vector<u64>, collection_data: &CollectionData): u64 {
        let total = 0u64;
        let i = 0;
        while (i < vector::length(token_ids)) {
            let token_id = *vector::borrow(token_ids, i);
            total = total + get_price_for_token(token_id, collection_data);
            i = i + 1;
        };
        total
    }

    // Mint a new NFT
    public entry fun mint_with_native<CoinType>(
        account: &signer,
        token_id: u64,
        amount: u64,
    ) acquires CollectionData {
        let collection_data = borrow_global<CollectionData>(@hero_nft);
        let price = get_price_for_token(token_id, collection_data);
        assert!(amount >= price, EINVALID_PAYMENT);

        coin::transfer<CoinType>(account, @hero_nft, price);

        // Only admin can mint
        assert!(signer::address_of(account) == collection_data.admin, ENOT_AUTHORIZED);
        mint_internal(account, token_id);

        event::emit(NFTMintedEvent {
            to: signer::address_of(account),
            token_id,
            payment_token: type_info::type_name<CoinType>(),
            price,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun set_price_config(
        account: &signer,
        token_id: u64,
        token_name: String,
        price: u64,
    ) acquires CollectionData {
        assert!(signer::address_of(account) == @hero_nft, 0);
        
        let collection_data = borrow_global_mut<CollectionData>(@hero_nft);
        let i = 0;
        let found = false;
        
        while (i < vector::length(&collection_data.price_configs)) {
            let config = vector::borrow_mut(&mut collection_data.price_configs, i);
            if (token_id == i) {
                config.token_type = token_name;
                config.price = price;
                config.is_active = true;
                found = true;
                break
            };
            i = i + 1;
        };
        
        if (!found) {
            vector::push_back(&mut collection_data.price_configs, PriceConfig {
                token_type: token_name,
                price,
                is_active: true,
            });
        };

        event::emit(PriceConfigUpdatedEvent {
            token_id,
            token_type: token_name,
            price,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun set_default_token_type(
        account: &signer,
        token_name: String,
    ) acquires CollectionData {
        assert!(signer::address_of(account) == @hero_nft, 0);
        
        let collection_data = borrow_global_mut<CollectionData>(@hero_nft);
        collection_data.default_token_type = token_name;
    }

    // Batch mint NFTs with native token
    public entry fun mint_batch_with_native<CoinType>(
        account: &signer,
        token_ids: vector<u64>,
        amount: u64,
    ) acquires CollectionData {
        let collection_data = borrow_global<CollectionData>(@hero_nft);
        let total_price = get_total_price_for_tokens(&token_ids, collection_data);
        assert!(amount >= total_price, EINVALID_PAYMENT);

        coin::transfer<CoinType>(account, @hero_nft, total_price);

        // Only admin can mint
        assert!(signer::address_of(account) == collection_data.admin, ENOT_AUTHORIZED);

        let i = 0;
        let len = vector::length(&token_ids);
        while (i < len) {
            let token_id = *vector::borrow(&token_ids, i);
            mint_internal(account, token_id);

            event::emit(NFTMintedEvent {
                to: signer::address_of(account),
                token_id,
                payment_token: type_info::type_name<CoinType>(),
                price: get_price_for_token(token_id, collection_data),
                timestamp: timestamp::now_seconds(),
            });
            i = i + 1;
        };
    }

    // Set default prices for native and token payments
    public entry fun set_default_prices(
        account: &signer,
        native_price: u64,
        token_price: u64,
    ) acquires CollectionData {
        assert!(signer::address_of(account) == @hero_nft, 0);
        
        let collection_data = borrow_global_mut<CollectionData>(@hero_nft);
        collection_data.default_native_price = native_price;
        collection_data.default_token_price = token_price;
    }

    // Internal functions
    fun mint_internal(account: &signer, token_id: u64) {
        let token_name = string::utf8(b"");
        string::append(&mut token_name, string::utf8(b"HERO #"));
        string::append(&mut token_name, string::utf8(num_to_string(token_id)));

        let collection = string::utf8(b"Hero NFT");
        let description = string::utf8(b"Hero NFT Collection");
        let uri = string::utf8(b"https://hero.example.com/nft/");

        // Create token data if it doesn't exist
        if (!token::check_tokendata_exists(@hero_nft, collection, token_name)) {
            let token_data_id = token::create_tokendata(
                account,
                collection,
                token_name,
                description,
                1, // maximum
                uri,
                @hero_nft, // royalty payee address
                100, // royalty points denominator
                5, // royalty points numerator (5%)
                token::create_token_mutability_config(&vector<bool>[false, false, false, false, false]), // token mutate config
                vector::empty<String>(), // property keys
                vector::empty<vector<u8>>(), // property values
                vector::empty<String>(), // property types
            );

            token::mint_token(
                account,
                token_data_id,
                1, // amount
            );
        };
    }

    fun num_to_string(num: u64): vector<u8> {
        if (num == 0) {
            return b"0"
        };
        let bytes = vector::empty<u8>();
        let n = num;
        while (n > 0) {
            let digit = ((48 + n % 10) as u8);
            vector::push_back(&mut bytes, digit);
            n = n / 10;
        };
        let len = vector::length(&bytes);
        let i = 0;
        while (i < len / 2) {
            let j = len - i - 1;
            let temp = *vector::borrow(&bytes, i);
            *vector::borrow_mut(&mut bytes, i) = *vector::borrow(&bytes, j);
            *vector::borrow_mut(&mut bytes, j) = temp;
            i = i + 1;
        };
        bytes
    }

    fun get_token_price<CoinType>(token_id: u64, collection_data: &CollectionData): u64 {
        let token_type = type_info::type_name<CoinType>();
        let i = 0;
        while (i < vector::length(&collection_data.price_configs)) {
            let config = vector::borrow(&collection_data.price_configs, i);
            if (token_id == i && config.is_active && token_type == config.token_type) {
                return config.price
            };
            i = i + 1;
        };
        collection_data.default_token_price
    }

    // Get default native price
    public fun get_default_native_price(): u64 acquires CollectionData {
        let collection_data = borrow_global<CollectionData>(@hero_nft);
        collection_data.default_native_price
    }

    // Check if token exists
    public fun token_exists(token_id: u64): bool {
        let token_name = string::utf8(b"");
        string::append(&mut token_name, string::utf8(b"HERO #"));
        string::append(&mut token_name, string::utf8(num_to_string(token_id)));
        token::check_tokendata_exists(@hero_nft, string::utf8(b"Hero NFT"), token_name)
    }

    // Get token owner
    public fun owner_of(token_id: u64, account: address): bool {
        let token_name = string::utf8(b"");
        string::append(&mut token_name, string::utf8(b"HERO #"));
        string::append(&mut token_name, string::utf8(num_to_string(token_id)));
        let token_data_id = token::create_token_data_id(@hero_nft, string::utf8(b"Hero NFT"), token_name);
        let property_version = 0;
        let token = token::create_token_id(token_data_id, property_version);
        token::balance_of(account, token) > 0
    }

    // Initialize token collection
    public entry fun initialize_token_collection(account: &signer) {
        let collection = string::utf8(b"Hero NFT");
        let description = string::utf8(b"Hero NFT Collection");
        let uri = string::utf8(b"https://hero.example.com/nft/");
        let maximum = 10000;

        token::create_collection(
            account,
            collection,
            description,
            uri,
            maximum,
            vector<bool>[true, true, true], // mutate_setting
        );
    }
} 