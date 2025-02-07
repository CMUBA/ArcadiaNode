#[test_only]
module hero::hero_test {
    use std::string;
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use hero::metadata;
    use hero::core;

    #[test(admin = @hero, framework = @0x1)]
    public entry fun test_initialize(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);

        // Initialize metadata
        metadata::initialize(admin);

        // Set race data
        let race_attrs = vector<u32>[100, 80, 60, 40];
        metadata::set_race(admin, 0, string::utf8(b"Human"), race_attrs);
        metadata::set_race(admin, 1, string::utf8(b"Elf"), race_attrs);

        // Set class data
        let class_attrs = vector<u32>[100, 80, 60, 40];
        metadata::set_class(admin, 0, string::utf8(b"Warrior"), class_attrs);
        metadata::set_class(admin, 1, string::utf8(b"Mage"), class_attrs);

        // Initialize hero system
        core::initialize(admin);
    }

    #[test(admin = @hero, framework = @0x1)]
    public entry fun test_create_hero(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        // Initialize
        test_initialize(admin, framework);

        // Create hero
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0, // Human
            0, // Warrior
        );

        // Verify hero data
        let hero = core::load_hero(signer::address_of(admin), 1);
        assert!(core::get_name(&hero) == string::utf8(b"Hero1"), 0);
        assert!(core::get_race(&hero) == 0, 1);
        assert!(core::get_class(&hero) == 0, 2);
        assert!(core::get_level(&hero) == 1, 3);
        assert!(core::get_exp(&hero) == 0, 4);
    }

    #[test(admin = @hero, framework = @0x1)]
    #[expected_failure(abort_code = 4, location = hero::core)] // EINVALID_RACE_ID
    public entry fun test_create_hero_invalid_race(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        test_initialize(admin, framework);
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            5, // Invalid race
            0,
        );
    }

    #[test(admin = @hero, framework = @0x1)]
    #[expected_failure(abort_code = 5, location = hero::core)] // EINVALID_CLASS_ID
    public entry fun test_create_hero_invalid_class(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        test_initialize(admin, framework);
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0,
            5, // Invalid class
        );
    }

    #[test(admin = @hero, framework = @0x1)]
    public entry fun test_save_hero(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        test_initialize(admin, framework);

        // Create hero
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0,
            0,
        );

        // Register node
        let node_addr = @0x123;
        core::register_node(admin, node_addr);

        // Save hero data
        let node_sig = vector::empty<u8>();
        let client_sig = vector::empty<u8>();
        core::save_hero(
            admin,
            1, // hero_id
            2, // new level
            1000, // new exp
            node_sig,
            client_sig,
        );

        // Verify updated data
        let hero = core::load_hero(signer::address_of(admin), 1);
        assert!(core::get_level(&hero) == 2, 0);
        assert!(core::get_exp(&hero) == 1000, 1);
    }

    #[test(admin = @hero, framework = @0x1)]
    #[expected_failure(abort_code = 3, location = hero::core)] // EINVALID_HERO_ID
    public entry fun test_save_hero_invalid_id(admin: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        test_initialize(admin, framework);
        let node_sig = vector::empty<u8>();
        let client_sig = vector::empty<u8>();
        core::save_hero(
            admin,
            999, // Invalid hero_id
            2,
            1000,
            node_sig,
            client_sig,
        );
    }
} 