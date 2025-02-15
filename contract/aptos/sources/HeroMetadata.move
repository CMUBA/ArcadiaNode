module hero::metadata {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const EINVALID_RACE: u64 = 3;
    const EINVALID_CLASS: u64 = 4;
    const EINVALID_SKILL: u64 = 5;
    const EALREADY_INITIALIZED: u64 = 6;

    /// Metadata structures
    struct Race has store, drop, copy {
        id: u64,
        name: String,
        description: String,
        base_stats: vector<u64>,
    }

    struct Class has store, drop, copy {
        id: u64,
        name: String,
        description: String,
        base_skills: vector<u64>,
    }

    struct Skill has store, drop, copy {
        id: u64,
        name: String,
        description: String,
        damage: u64,
        cost: u64,
    }

    /// Metadata store resource
    struct MetadataStore has key {
        races: vector<Race>,
        classes: vector<Class>,
        skills: vector<Skill>,
    }

    // Events
    #[event]
    struct RaceAddedEvent has drop, store {
        race_id: u64,
        name: String,
        timestamp: u64,
    }

    #[event]
    struct ClassAddedEvent has drop, store {
        class_id: u64,
        name: String,
        timestamp: u64,
    }

    #[event]
    struct SkillAddedEvent has drop, store {
        skill_id: u64,
        name: String,
        timestamp: u64,
    }

    /// Initialize metadata
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @hero_nft, ENOT_AUTHORIZED);
        if (!exists<MetadataStore>(admin_addr)) {
            // Create empty metadata store
            move_to(admin, MetadataStore {
                races: vector::empty(),
                classes: vector::empty(),
                skills: vector::empty(),
            });
        };
    }

    /// Add a new race
    public entry fun add_race(
        admin: &signer,
        name: String,
        description: String,
        base_stats: vector<u64>,
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let race = Race {
            id: vector::length(&store.races) as u64,
            name,
            description,
            base_stats,
        };

        vector::push_back(&mut store.races, race);

        // Emit event
        event::emit(RaceAddedEvent {
            race_id: race.id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Add a new class
    public entry fun add_class(
        admin: &signer,
        name: String,
        description: String,
        base_skills: vector<u64>,
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let class = Class {
            id: vector::length(&store.classes) as u64,
            name,
            description,
            base_skills,
        };

        vector::push_back(&mut store.classes, class);

        // Emit event
        event::emit(ClassAddedEvent {
            class_id: class.id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Add a new skill
    public entry fun add_skill(
        admin: &signer,
        name: String,
        description: String,
        damage: u64,
        cost: u64,
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let skill = Skill {
            id: vector::length(&store.skills) as u64,
            name,
            description,
            damage,
            cost,
        };

        vector::push_back(&mut store.skills, skill);

        // Emit event
        event::emit(SkillAddedEvent {
            skill_id: skill.id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get race by ID
    public fun get_race(race_id: u64): Race acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        assert!(race_id < vector::length(&store.races), EINVALID_RACE);
        *vector::borrow(&store.races, race_id)
    }

    /// Get class by ID
    public fun get_class(class_id: u64): Class acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        assert!(class_id < vector::length(&store.classes), EINVALID_CLASS);
        *vector::borrow(&store.classes, class_id)
    }

    /// Get skill by ID
    public fun get_skill(skill_id: u64): Skill acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        assert!(skill_id < vector::length(&store.skills), EINVALID_SKILL);
        *vector::borrow(&store.skills, skill_id)
    }

    /// Getter functions for Race
    public fun get_race_name(race: Race): String {
        race.name
    }

    public fun get_race_description(race: Race): String {
        race.description
    }

    public fun get_race_stats(race: Race): vector<u64> {
        race.base_stats
    }

    /// Getter functions for Class
    public fun get_class_name(class: Class): String {
        class.name
    }

    public fun get_class_description(class: Class): String {
        class.description
    }

    public fun get_class_skills(class: Class): vector<u64> {
        class.base_skills
    }

    /// Getter functions for Skill
    public fun get_skill_name(skill: Skill): String {
        skill.name
    }

    public fun get_skill_description(skill: Skill): String {
        skill.description
    }

    public fun get_skill_damage(skill: Skill): u64 {
        skill.damage
    }

    public fun get_skill_cost(skill: Skill): u64 {
        skill.cost
    }

    /// Get all races
    public fun get_all_races(): vector<Race> acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        *&store.races
    }

    /// Get all classes
    public fun get_all_classes(): vector<Class> acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        *&store.classes
    }

    /// Get all skills
    public fun get_all_skills(): vector<Skill> acquires MetadataStore {
        let store = borrow_global<MetadataStore>(@hero);
        *&store.skills
    }

    // Set race attributes
    public entry fun set_race(
        admin: &signer,
        race_id: u64,
        name: String,
        base_attributes: vector<u64>
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let race = Race {
            id: race_id,
            name,
            description: string::utf8(b""),
            base_stats: base_attributes,
        };

        if (race_id >= (vector::length(&store.races) as u64)) {
            vector::push_back(&mut store.races, race);
        } else {
            *vector::borrow_mut(&mut store.races, race_id) = race;
        };

        event::emit(RaceAddedEvent {
            race_id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Set class attributes
    public entry fun set_class(
        admin: &signer,
        class_id: u64,
        name: String,
        base_attributes: vector<u64>
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let class = Class {
            id: class_id,
            name,
            description: string::utf8(b""),
            base_skills: base_attributes,
        };

        if (class_id >= (vector::length(&store.classes) as u64)) {
            vector::push_back(&mut store.classes, class);
        } else {
            *vector::borrow_mut(&mut store.classes, class_id) = class;
        };

        event::emit(ClassAddedEvent {
            class_id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Set skill attributes
    public entry fun set_skill(
        admin: &signer,
        skill_id: u64,
        name: String,
        attributes: vector<u64>,
    ) acquires MetadataStore {
        assert!(signer::address_of(admin) == @hero, ENOT_AUTHORIZED);
        assert!(vector::length(&attributes) >= 2, EINVALID_SKILL);
        let store = borrow_global_mut<MetadataStore>(@hero);
        
        let skill = Skill {
            id: skill_id,
            name,
            description: string::utf8(b""),
            damage: *vector::borrow(&attributes, 0),
            cost: *vector::borrow(&attributes, 1),
        };

        if (skill_id >= (vector::length(&store.skills) as u64)) {
            vector::push_back(&mut store.skills, skill);
        } else {
            *vector::borrow_mut(&mut store.skills, skill_id) = skill;
        };

        event::emit(SkillAddedEvent {
            skill_id,
            name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Check if metadata is initialized
    public fun is_initialized(): bool {
        exists<MetadataStore>(@hero)
    }
}
