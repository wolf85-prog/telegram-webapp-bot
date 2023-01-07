require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true});