import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

let account = null;

// Connect wallet using Wallet Standard
async function connectWallet() {
    try {
        // Check if Petra wallet is installed
        if (!window.aptos) {
            throw new Error('Please install Petra wallet extension');
        }

        // Use Wallet Standard to connect
        const response = await window.aptos.connect();
        account = response.address;
        
        // Update UI
        document.getElementById('walletAddress').textContent = `Connected: ${account}`;
        showMessage('Wallet connected successfully');
        
        // Enable buttons that require wallet connection
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = false;
        }
        
        // Refresh metadata after connection
        await refreshMetadata();
        
        return true;
    } catch (error) {
        showMessage(`Error connecting wallet: ${error.message}`);
        return false;
    }
}

// Add race
async function addRace() {
    try {
        const name = document.getElementById('raceName').value;
        const description = document.getElementById('raceDescription').value;
        const stats = document.getElementById('raceStats').value
            .split(',')
            .map(x => Number.parseInt(x.trim()));

        const payload = {
            type: "entry_function_payload",
            function: "hero::metadata::add_race",
            type_arguments: [],
            arguments: [name, description, stats]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Race added successfully');
        refreshMetadata();
    } catch (error) {
        showMessage(`Error adding race: ${error.message}`);
    }
}

// Add class
async function addClass() {
    try {
        const name = document.getElementById('className').value;
        const description = document.getElementById('classDescription').value;
        const skills = document.getElementById('classSkills').value
            .split(',')
            .map(x => Number.parseInt(x.trim()));

        const payload = {
            type: "entry_function_payload",
            function: "hero::metadata::add_class",
            type_arguments: [],
            arguments: [name, description, skills]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Class added successfully');
        refreshMetadata();
    } catch (error) {
        showMessage(`Error adding class: ${error.message}`);
    }
}

// Add skill
async function addSkill() {
    try {
        const name = document.getElementById('skillName').value;
        const description = document.getElementById('skillDescription').value;
        const damage = Number.parseInt(document.getElementById('skillDamage').value);
        const cost = Number.parseInt(document.getElementById('skillCost').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::metadata::add_skill",
            type_arguments: [],
            arguments: [name, description, damage, cost]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Skill added successfully');
        refreshMetadata();
    } catch (error) {
        showMessage(`Error adding skill: ${error.message}`);
    }
}

// Refresh metadata information
async function refreshMetadata() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const races = await aptos.view({
            function: "hero::metadata::get_all_races",
            type_arguments: [],
            arguments: []
        });

        const classes = await aptos.view({
            function: "hero::metadata::get_all_classes",
            type_arguments: [],
            arguments: []
        });

        const skills = await aptos.view({
            function: "hero::metadata::get_all_skills",
            type_arguments: [],
            arguments: []
        });

        // Display races
        const raceList = document.getElementById('raceList');
        raceList.innerHTML = races.map(race => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${race.name}</p>
                <p><strong>Description:</strong> ${race.description}</p>
                <p><strong>Base Stats:</strong> ${race.base_stats.join(', ')}</p>
            </div>
        `).join('');

        // Display classes
        const classList = document.getElementById('classList');
        classList.innerHTML = classes.map(class_ => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${class_.name}</p>
                <p><strong>Description:</strong> ${class_.description}</p>
                <p><strong>Base Skills:</strong> ${class_.base_skills.join(', ')}</p>
            </div>
        `).join('');

        // Display skills
        const skillList = document.getElementById('skillList');
        skillList.innerHTML = skills.map(skill => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${skill.name}</p>
                <p><strong>Description:</strong> ${skill.description}</p>
                <p><strong>Damage:</strong> ${skill.damage}</p>
                <p><strong>Cost:</strong> ${skill.cost}</p>
            </div>
        `).join('');
    } catch (error) {
        showMessage(`Error refreshing metadata: ${error.message}`);
    }
}

// Event listeners
window.connectWallet = connectWallet;
window.addRace = addRace;
window.addClass = addClass;
window.addSkill = addSkill;
window.refreshMetadata = refreshMetadata;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.aptos?.isConnected) {
            await connectWallet();
        }
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage(`Error during initialization: ${error.message}`);
    }
}); 