const {bot} = require("../../connections/token.connection");

module.exports = bot.help(async (ctx) => {
    try {
        const login = String(ctx.chat.id);
        console.log(login);
    } catch (error) {
        console.log(error);
    }
})