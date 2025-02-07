module hero_nft::nft {
    use std::string;
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self as coin};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::type_info;
    use aptos_token::token;

    // Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const EINVALID_TOKEN_ID: u64 = 2;
    const ETOKEN_ALREADY_EXISTS: u64 = 3;
    const ETOKEN_NOT_EXISTS: u64 = 4;
    const ENOT_OWNER: u64 = 5;
    const EINVALID_PAYMENT: u64 = 6;

    // Price configuration structure
    struct PriceConfig has store, drop {
        token_type: string::String,
        price: u64,
        is_active: bool,
    }

    // NFT collection data
    struct CollectionData has key {
        name: string::String,
        description: string::String,
        uri: string::String,
        default_native_price: u64,
        default_token_price: u64,
        default_token_type: string::String,
        price_configs: vector<PriceConfig>,
    }

    // Events
    #[event]
    struct NFTMintedEvent has drop, store {
        to: address,
        token_id: u64,
        payment_token: string::String,
        price: u64,
        timestamp: u64,
    }

    #[event]
    struct PriceConfigUpdatedEvent has drop, store {
        token_id: u64,
        token_type: string::String,
        price: u64,
        timestamp: u64,
    }

    // Initialize the NFT collection
    public entry fun initialize(
        account: &signer,
        name: string::String,
        description: string::String,
        uri: string::String,
        default_token_name: string::String,
        default_native_price: u64,
        default_token_price: u64,
    ) {
        let collection_data = CollectionData {
            name,
            description,
            uri,
            default_native_price,
            default_token_price,
            default_token_type: default_token_name,
            price_configs: vector::empty(),
        };
        move_to(account, collection_data);

        token::create_collection(
            account,
            name,
            description,
            uri,
            0,
            vector::empty(),
        );
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
        token_name: string::String,
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
        token_name: string::String,
    ) acquires CollectionData {
        assert!(signer::address_of(account) == @hero_nft, 0);
        
        let collection_data = borrow_global_mut<CollectionData>(@hero_nft);
        collection_data.default_token_type = token_name;
    }

    // Internal functions
    fun mint_internal(account: &signer, _token_id: u64) {
        let token_data_id = token::create_token_data_id(
            @hero_nft,
            string::utf8(b"Hero NFT"),
            string::utf8(b"HERO"),
        );

        token::mint_token(
            account,
            token_data_id,
            1,
        );
    }

    fun get_price_for_token(token_id: u64, collection_data: &CollectionData): u64 {
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
} 