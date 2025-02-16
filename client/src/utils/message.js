// Message display utility
export function showMessage(message, isError = false, duration = 5000) {
    const messageElement = document.getElementById(isError ? 'error' : 'message');
    if (!messageElement) return;

    // Clear any existing timeouts
    if (messageElement._hideTimeout) {
        clearTimeout(messageElement._hideTimeout);
    }

    // Set message and show
    messageElement.textContent = message;
    messageElement.style.opacity = '0';
    messageElement.classList.remove('hidden');

    // Fade in
    setTimeout(() => {
        messageElement.style.opacity = '1';
    }, 10);

    // Set timeout to fade out
    messageElement._hideTimeout = setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 500); // Wait for fade out animation
    }, duration);
}

// Error display utility
export function showError(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    showMessage(errorMessage, true);

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