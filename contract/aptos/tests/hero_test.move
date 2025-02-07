#[test_only]
module hero::hero_test {
    use std::string;
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use hero::metadata;
    use hero::core;

    #[test(admin = @hero)]
    public entry fun test_initialize(admin: &signer) {
        // 设置时间戳
        timestamp::set_time_has_started_for_testing(admin);

        // 初始化元数据
        metadata::initialize(admin);

        // 设置种族数据
        let race_attrs = vector<u16>[100, 80, 60, 40];
        metadata::set_race(admin, 0, string::utf8(b"Human"), race_attrs);
        metadata::set_race(admin, 1, string::utf8(b"Elf"), race_attrs);

        // 设置职业数据
        let class_attrs = vector<u16>[100, 80, 60, 40];
        metadata::set_class(admin, 0, string::utf8(b"Warrior"), class_attrs);
        metadata::set_class(admin, 1, string::utf8(b"Mage"), class_attrs);

        // 初始化英雄系统
        core::initialize(admin);
    }

    #[test(admin = @hero)]
    public entry fun test_create_hero(admin: &signer) {
        // 初始化
        test_initialize(admin);

        // 创建英雄
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0, // Human
            0, // Warrior
        );

        // 验证英雄数据
        let hero = core::load_hero(signer::address_of(admin), 1);
        assert!(hero.name == string::utf8(b"Hero1"), 0);
        assert!(hero.race == 0, 1);
        assert!(hero.class == 0, 2);
        assert!(hero.level == 1, 3);
        assert!(hero.exp == 0, 4);
    }

    #[test(admin = @hero)]
    #[expected_failure(abort_code = 4)] // EINVALID_RACE_ID
    public entry fun test_create_hero_invalid_race(admin: &signer) {
        test_initialize(admin);
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            5, // Invalid race
            0,
        );
    }

    #[test(admin = @hero)]
    #[expected_failure(abort_code = 5)] // EINVALID_CLASS_ID
    public entry fun test_create_hero_invalid_class(admin: &signer) {
        test_initialize(admin);
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0,
            5, // Invalid class
        );
    }

    #[test(admin = @hero)]
    public entry fun test_save_hero(admin: &signer) {
        test_initialize(admin);

        // 创建英雄
        core::create_hero(
            admin,
            string::utf8(b"Hero1"),
            0,
            0,
        );

        // 注册节点
        let node_addr = @0x123;
        core::register_node(admin, node_addr);

        // 保存英雄数据
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

        // 验证更新后的数据
        let hero = core::load_hero(signer::address_of(admin), 1);
        assert!(hero.level == 2, 0);
        assert!(hero.exp == 1000, 1);
    }

    #[test(admin = @hero)]
    #[expected_failure(abort_code = 3)] // EINVALID_HERO_ID
    public entry fun test_save_hero_invalid_id(admin: &signer) {
        test_initialize(admin);
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