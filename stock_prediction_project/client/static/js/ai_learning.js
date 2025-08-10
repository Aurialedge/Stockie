const chatDisplay = document.getElementById('chat-display');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const imageUpload = document.getElementById('image-upload');
const historyList = document.getElementById('history-list');

let conversationHistory = [];

sendBtn.addEventListener('click', function () {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        displayMessage(userMessage, 'user');
        chatInput.value = ''; // Clear input after sending
        // get ai response

        getAIResponse(userMessage).then((aiResponse) => {
            displayMessage(aiResponse, 'bot');
        });
    }
});

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Replace new lines with <br>
    chatDisplay.appendChild(messageElement);
    chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll to the bottom
}

function addToHistory(message) {
    conversationHistory.push(message);
    const listItem = document.createElement('li');
    listItem.textContent = message.length > 20 ? message.substring(0, 20) + '...' : message;
    historyList.appendChild(listItem);
}

addToHistory("stock data");
addToHistory("best practices");
addToHistory("investment tips");
addToHistory("portfolio management");

document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded');
});

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    const chatlog = document.getElementById('chatlog');
    const userMessage = document.createElement('div');
    userMessage.textContent = `You: ${userInput}`;
    chatlog.appendChild(userMessage);

    console.log('User input:', userInput);

    // Fetch AI response and append it to the chatlog
    getAIResponse(userInput).then((aiResponseText) => {
        const aiResponse = document.createElement('div');
        aiResponse.textContent = `AI: ${aiResponseText}`;
        chatlog.appendChild(aiResponse);

        document.getElementById('userInput').value = '';
        chatlog.scrollTop = chatlog.scrollHeight;
    });
}

function getAIResponse(input) {
    return fetch('/ai_learning_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
    })
    .then(response => response.json())
    .then(data => {
        return data.message;
    });
}