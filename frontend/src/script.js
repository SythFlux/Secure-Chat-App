const client = mqtt.connect("wss://netwerkenbasis.com:8884", {
    username: "student",
    password: "welkom01",
    connectTimeout: 4000,
    clean: true
});

const userId = "User-" + Math.floor(Math.random() * 10000);
const room = "chat/message";
let lastSentMessage = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("userDisplay").textContent = `Jouw gebruikersnaam: ${userId}`;
});

client.on("connect", () => {
    console.log("Connected to Secure MQTT Broker (WSS)");
    client.subscribe(room);

    const joinMessage = `${userId} has joined the chat`;
    client.publish(room, joinMessage);
});

client.on("message", (topic, message) => {
    const rawMessage = message.toString();

    if (rawMessage === lastSentMessage) {
        lastSentMessage = null;
        return;
    }

    displayMessage(rawMessage, "received");
});

document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("messageInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    if (messageInput.value.trim() === "") return;

    const fullMessage = messageInput.value.trim();
    client.publish(room, fullMessage);

    lastSentMessage = fullMessage;
    displayMessage(fullMessage, "sent");

    messageInput.value = "";
}

function displayMessage(message, type) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${type}`;

    const textNode = document.createElement("p");
    textNode.textContent = message;
    msgDiv.appendChild(textNode);

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    msgDiv.style.opacity = "0";
    msgDiv.style.transform = type === "sent" ? "translateX(20px)" : "translateX(-20px)";
    setTimeout(() => {
        msgDiv.style.transition = "all 0.3s ease";
        msgDiv.style.opacity = "1";
        msgDiv.style.transform = "translateX(0)";
    }, 50);
}

window.addEventListener("beforeunload", () => {
    const leaveMessage = `${userId} has left the chat`;
    client.publish(room, leaveMessage);
    client.end();
});
