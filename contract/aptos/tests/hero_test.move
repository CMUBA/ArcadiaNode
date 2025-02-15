#[test_only]
module hero::hero_test {
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::signer;
    use hero::hero;
    use hero::metadata;

    fun setup_test(framework: &signer, admin: &signer) {
        // Set up timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        
        // Create admin account if it doesn't exist
        if (!account::exists_at(signer::address_of(admin))) {
            account::create_account_for_test(signer::address_of(admin));
        }
    }

    #[test(framework = @0x1, admin = @hero)]
    public fun test_initialize(framework: &signer, admin: &signer) {
        // Set up test environment
        setup_test(framework, admin);
        
        // Initialize modules
        hero::initialize(admin);
        metadata::initialize(admin);
        
        // Set up race attributes
        let race_attrs = vector::empty<u64>();
        vector::push_back(&mut race_attrs, 100); // strength
        vector::push_back(&mut race_attrs, 80);  // agility
        
        // Set up races
        metadata::set_race(admin, 0, string::utf8(b"Human"), race_attrs);
        let race_attrs = vector::empty<u64>();
        vector::push_back(&mut race_attrs, 80);  // strength
        vector::push_back(&mut race_attrs, 100); // agility
        metadata::set_race(admin, 1, string::utf8(b"Elf"), race_attrs);
        
        // Set up class attributes
        let class_attrs = vector::empty<u64>();
        vector::push_back(&mut class_attrs, 1); // basic attack
        vector::push_back(&mut class_attrs, 2); // defense
        
        // Set up classes
        metadata::set_class(admin, 0, string::utf8(b"Warrior"), class_attrs);
        let class_attrs = vector::empty<u64>();
        vector::push_back(&mut class_attrs, 3); // magic attack
        vector::push_back(&mut class_attrs, 4); // magic defense
        metadata::set_class(admin, 1, string::utf8(b"Mage"), class_attrs);
    }

    #[test(framework = @0x1, admin = @hero, account = @0x1)]
    public fun test_create_hero(framework: &signer, admin: &signer) {
        // Set up test environment
        setup_test(framework, admin);
        
        // Initialize modules
        hero::initialize(admin);
        metadata::initialize(admin);
        
        // Set up race attributes
        let race_attrs = vector::empty<u64>();
        vector::push_back(&mut race_attrs, 100); // strength
        vector::push_back(&mut race_attrs, 80);  // agility
        
        // Set up races
        metadata::set_race(admin, 0, string::utf8(b"Human"), race_attrs);
        let race_attrs = vector::empty<u64>();
        vector::push_back(&mut race_attrs, 80);  // strength
        vector::push_back(&mut race_attrs, 100); // agility
        metadata::set_race(admin, 1, string::utf8(b"Elf"), race_attrs);
        
        // Set up class attributes
        let class_attrs = vector::empty<u64>();
        vector::push_back(&mut class_attrs, 1); // basic attack
        vector::push_back(&mut class_attrs, 2); // defense
        
        // Set up classes
        metadata::set_class(admin, 0, string::utf8(b"Warrior"), class_attrs);
        let class_attrs = vector::empty<u64>();
        vector::push_back(&mut class_attrs, 3); // magic attack
        vector::push_back(&mut class_attrs, 4); // magic defense
        metadata::set_class(admin, 1, string::utf8(b"Mage"), class_attrs);
        
        // Create hero
        let name = string::utf8(b"Hero1");
        hero::create_hero(admin, name, 0, 0);
        
        // Get hero info
        let account_addr = signer::address_of(admin);
        let (hero_name, race_id, class_id, level, energy, daily_points) = 
            hero::get_hero_info(account_addr);
            
        assert!(hero_name == name, 0);
        assert!(race_id == 0, 1);
        assert!(class_id == 0, 2);
        assert!(level == 1, 3);
        assert!(energy == 100, 4);
        assert!(daily_points == 0, 5);
    }

    #[test(framework = @0x1, admin = @hero)]
    #[expected_failure(abort_code = 4, location = hero::metadata)] // EINVALID_CLASS
    public fun test_create_hero_invalid_class(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Try to create hero with invalid class
        let name = string::utf8(b"Hero1");
        hero::create_hero(admin, name, 0, 999);
    }

    #[test(framework = @0x1, admin = @hero)]
    #[expected_failure(abort_code = 3, location = hero::metadata)] // EINVALID_RACE
    public fun test_create_hero_invalid_race(framework: &signer, admin: &signer) {
        // Initialize
        test_initialize(framework, admin);
        
        // Try to create hero with invalid race
        let name = string::utf8(b"Hero1");
        hero::create_hero(admin, name, 999, 0);
    }

    #[test(framework = @0x1, admin = @hero, account = @0x1)]
    public fun test_update_hero(framework: &signer, admin: &signer, account: &signer) {
        // Initialize and create hero
        test_initialize(framework, admin);
        
        // Set up skill first
        let skill_attrs = vector::empty<u64>();
        vector::push_back(&mut skill_attrs, 100); // damage
        vector::push_back(&mut skill_attrs, 50);  // cost
        metadata::set_skill(admin, 0, string::utf8(b"Slash"), skill_attrs);
        
        // Create hero
        let name = string::utf8(b"Hero1");
        hero::create_hero(account, name, 0, 0);
        
        // Update skill
        hero::update_skill(account, 0);
        
        // Update equipment
        let equipment = string::utf8(b"Sword");
        hero::update_equipment(account, equipment);
        
        // Get hero info
        let account_addr = signer::address_of(account);
        let skills = hero::get_hero_skills(account_addr);
        let equipment_list = hero::get_hero_equipment(account_addr);
        
        assert!(vector::length(&skills) == 1, 0);
        assert!(vector::length(&equipment_list) == 1, 1);
        assert!(*vector::borrow(&equipment_list, 0) == string::utf8(b"Sword"), 2);
    }
} 