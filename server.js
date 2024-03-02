const telegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const bot = new telegramBot(process.env.TELEGRAM_API_KEY, { polling: true });

//store previous conversations
const previousMessages = {};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = msg.text;
        
        // Retrieve the previous message for this chat
        const previousMessage = previousMessages[chatId];
        
        // Concatenate the previous message with the current prompt
        const fullPrompt = previousMessage ? `${previousMessage} ${prompt}` : prompt;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        await bot.sendMessage(chatId, text);
        
        // Update the previous message for this chat
        previousMessages[chatId] = fullPrompt;
    } else if (msg.photo) {
        bot.sendMessage(chatId, "You can only send a text message for this time.");
    }
});
