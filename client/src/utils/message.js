// Message display utility
export function showMessage(message, duration = 3000) {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('hidden');
    messageElement.classList.add('bg-green-500');

    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, duration);
}

// Error display utility
export function showError(message, error = null) {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;

    const errorMessage = error ? `${message}: ${error.message}` : message;
    messageElement.textContent = errorMessage;
    messageElement.classList.remove('hidden', 'bg-green-500');
    messageElement.classList.add('bg-red-500');

    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);

    if (error) {
        console.error(error);
    }
}

// Event logging utility
export function logEvent(message) {
    const eventLog = document.getElementById('eventLog');
    if (!eventLog) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    eventLog.appendChild(logEntry);
    eventLog.scrollTop = eventLog.scrollHeight;
} 