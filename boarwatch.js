require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

//check if logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

function logToFile(message) {
    const logFile = path.join(logsDir, `boar.log`);
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(logFile, logMessage, 'utf8');
    console.log(logMessage.trim());
}

client.once('ready', () => {
    logToFile(`[${new Date().toLocaleString()}] Logged in!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.member) return;
    
    //check server
    const guild = newPresence.guild; 
    if (!guild || guild.id !== process.env.SERVER) return;

    //check user
    const user = newPresence.member.user;
    if (user.id !== process.env.BOT) return;

    //check status
    const oldStatus = oldPresence?.status || 'offline';
    const newStatus = newPresence.status;

    if (newStatus === 'offline' && oldStatus !== 'offline') {
        logToFile(`[${new Date().toLocaleString()}] BoarBot went offline`);

        const channel = client.channels.cache.get(process.env.CHANNEL);

        if (channel) {
            channel.send(`<@${process.env.PING}> BoarBot just went offline!`);
        } else {
            logToFile(`[${new Date().toLocaleString()}] Channel not found`);
        }
    }
});

client.login(process.env.TOKEN).catch(error => {
    logToFile('Failed to login:', error);
});
