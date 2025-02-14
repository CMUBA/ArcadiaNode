import { AptosClient, AptosAccount, CoinClient, TokenClient } from "@aptos-labs/ts-sdk";
import { showMessage } from './utils.js';

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

let account = null;

// Connect wallet
async function connectWallet() {
    try {
        const response = await window.aptos.connect();
        account = response.address;
        document.getElementById('walletAddress').textContent = `Connected: ${account}`;
        showMessage('Wallet connected successfully');
    } catch (error) {
        showMessage(`Error connecting wallet: ${error.message}`);
    }
}

// Create hero
async function createHero() {
    try {
        const name = document.getElementById('heroName').value;
        const race = Number.parseInt(document.getElementById('heroRace').value);
        const class_ = Number.parseInt(document.getElementById('heroClass').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::create_hero",
            type_arguments: [],
            arguments: [name, race, class_]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await client.waitForTransaction(response.hash);
        showMessage('Hero created successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error creating hero: ${error.message}`);
    }
}

// Add skill
async function addSkill() {
    try {
        const skillId = Number.parseInt(document.getElementById('skillSelect').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::update_skill",
            type_arguments: [],
            arguments: [skillId]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await client.waitForTransaction(response.hash);
        showMessage('Skill added successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error adding skill: ${error.message}`);
    }
}

// Add equipment
async function addEquipment() {
    try {
        const equipment = document.getElementById('equipmentName').value;

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::update_equipment",
            type_arguments: [],
            arguments: [equipment]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await client.waitForTransaction(response.hash);
        showMessage('Equipment added successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error adding equipment: ${error.message}`);
    }
}

// Consume energy
async function consumeEnergy() {
    try {
        const amount = Number.parseInt(document.getElementById('energyAmount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::consume_energy",
            type_arguments: [],
            arguments: [amount]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await client.waitForTransaction(response.hash);
        showMessage('Energy consumed successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error consuming energy: ${error.message}`);
    }
}

// Add daily points
async function addDailyPoints() {
    try {
        const points = Number.parseInt(document.getElementById('pointsAmount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::add_daily_points",
            type_arguments: [],
            arguments: [points]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await client.waitForTransaction(response.hash);
        showMessage('Points added successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error adding points: ${error.message}`);
    }
}

// Refresh hero information
async function refreshHeroInfo() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const heroInfo = await client.view({
            function: "hero::hero::get_hero_info",
            type_arguments: [],
            arguments: [account]
        });

        const skills = await client.view({
            function: "hero::hero::get_hero_skills",
            type_arguments: [],
            arguments: [account]
        });

        const equipment = await client.view({
            function: "hero::hero::get_hero_equipment",
            type_arguments: [],
            arguments: [account]
        });

        const heroInfoDiv = document.getElementById('heroInfo');
        heroInfoDiv.innerHTML = `
            <p><strong>Name:</strong> ${heroInfo[0]}</p>
            <p><strong>Race:</strong> ${heroInfo[1]}</p>
            <p><strong>Class:</strong> ${heroInfo[2]}</p>
            <p><strong>Level:</strong> ${heroInfo[3]}</p>
            <p><strong>Energy:</strong> ${heroInfo[4]}</p>
            <p><strong>Daily Points:</strong> ${heroInfo[5]}</p>
            <p><strong>Skills:</strong> ${JSON.stringify(skills)}</p>
            <p><strong>Equipment:</strong> ${JSON.stringify(equipment)}</p>
        `;
    } catch (error) {
        showMessage(`Error refreshing hero info: ${error.message}`);
    }
}

// Event listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('createHero').addEventListener('click', createHero);
document.getElementById('addSkill').addEventListener('click', addSkill);
document.getElementById('addEquipment').addEventListener('click', addEquipment);
document.getElementById('consumeEnergy').addEventListener('click', consumeEnergy);
document.getElementById('addPoints').addEventListener('click', addDailyPoints);
document.getElementById('refreshInfo').addEventListener('click', refreshHeroInfo); 