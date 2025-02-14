module hero::hero {
    use std::string::String;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::signer;
    use hero::metadata;

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_HERO: u64 = 2;
    const EINSUFFICIENT_ENERGY: u64 = 3;
    const EDAILY_LIMIT_REACHED: u64 = 4;

    // Hero data structure
    struct Hero has key, store {
        name: String,
        race_id: u64,
        class_id: u64,
        level: u64,
        energy: u64,
        daily_points: u64,
        skills: vector<u64>,
        equipment: vector<String>,
        last_energy_update: u64,
        last_points_update: u64,
    }

    // Events
    #[event]
    struct HeroCreatedEvent has drop, store {
        owner: address,
        name: String,
        race_id: u64,
        class_id: u64,
        timestamp: u64,
    }

    #[event]
    struct SkillUpdatedEvent has drop, store {
        owner: address,
        hero_name: String,
        skill_id: u64,
        timestamp: u64,
    }

    #[event]
    struct EquipmentUpdatedEvent has drop, store {
        owner: address,
        hero_name: String,
        equipment: String,
        timestamp: u64,
    }

    // Initialize module
    public entry fun initialize(account: &signer) {
        // Initialize metadata module first
        metadata::initialize(account);
    }

    // Create a new hero
    public entry fun create_hero(
        account: &signer,
        name: String,
        race_id: u64,
        class_id: u64,
    ) {
        // Verify race and class exist
        let _race = metadata::get_race(race_id);
        let _class = metadata::get_class(class_id);

        let hero = Hero {
            name,
            race_id,
            class_id,
            level: 1,
            energy: 100,
            daily_points: 0,
            skills: vector::empty(),
            equipment: vector::empty(),
            last_energy_update: timestamp::now_seconds(),
            last_points_update: timestamp::now_seconds(),
        };

        move_to(account, hero);

        event::emit(HeroCreatedEvent {
            owner: signer::address_of(account),
            name,
            race_id,
            class_id,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Update hero skill
    public entry fun update_skill(
        account: &signer,
        skill_id: u64,
    ) acquires Hero {
        // Verify skill exists
        let _skill = metadata::get_skill(skill_id);

        let hero = borrow_global_mut<Hero>(signer::address_of(account));
        vector::push_back(&mut hero.skills, skill_id);

        event::emit(SkillUpdatedEvent {
            owner: signer::address_of(account),
            hero_name: hero.name,
            skill_id,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Update hero equipment
    public entry fun update_equipment(
        account: &signer,
        equipment: String,
    ) acquires Hero {
        let hero = borrow_global_mut<Hero>(signer::address_of(account));
        vector::push_back(&mut hero.equipment, equipment);

        event::emit(EquipmentUpdatedEvent {
            owner: signer::address_of(account),
            hero_name: hero.name,
            equipment,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Consume hero energy
    public entry fun consume_energy(
        account: &signer,
        amount: u64,
    ) acquires Hero {
        let hero = borrow_global_mut<Hero>(signer::address_of(account));
        assert!(hero.energy >= amount, EINSUFFICIENT_ENERGY);
        hero.energy = hero.energy - amount;
        hero.last_energy_update = timestamp::now_seconds();
    }

    // Add daily points
    public entry fun add_daily_points(
        account: &signer,
        points: u64,
    ) acquires Hero {
        let hero = borrow_global_mut<Hero>(signer::address_of(account));
        let current_time = timestamp::now_seconds();
        
        // Reset points if it's a new day
        if (current_time - hero.last_points_update >= 86400) {
            hero.daily_points = 0;
        };
        
        assert!(hero.daily_points + points <= 1000, EDAILY_LIMIT_REACHED);
        hero.daily_points = hero.daily_points + points;
        hero.last_points_update = current_time;
    }

    // Get hero info
    public fun get_hero_info(owner: address): (String, u64, u64, u64, u64, u64) acquires Hero {
        let hero = borrow_global<Hero>(owner);
        (hero.name, hero.race_id, hero.class_id, hero.level, hero.energy, hero.daily_points)
    }

    // Get hero skills
    public fun get_hero_skills(owner: address): vector<u64> acquires Hero {
        let hero = borrow_global<Hero>(owner);
        *&hero.skills
    }

    // Get hero equipment
    public fun get_hero_equipment(owner: address): vector<String> acquires Hero {
        let hero = borrow_global<Hero>(owner);
        *&hero.equipment
    }
}
