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

const timestamp = new Date().toLocaleString();

//check logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

function logToFile(message) {
    const logFile = path.join(logsDir, `boar.log`);
    const logMessage = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(logFile, logMessage, 'utf8');
    console.log(logMessage.trim());
}

// alternative logToFile function with one log file per day
//function logToFile(message) {
//    const logFile = path.join(logsDir, `${new Date().toLocaleDateString}.log`);
//    const logMessage = `[${timestamp}] ${message}\n`;
//    
//    fs.appendFileSync(logFile, logMessage, 'utf8');
//    console.log(logMessage.trim());
//}

client.once('ready', () => {
    logToFile(`Logged in!`);
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
        logToFile(`BoarBot went offline`);

        const channel = client.channels.cache.get(process.env.CHANNEL);

        if (channel) {
            channel.send(`<@${process.env.PING}> BoarBot just went offline!`);
        } else {
            logToFile(`Channel not found`);
        }
    }
});

client.login(process.env.TOKEN).catch(error => {
    logToFile('Failed to login:', error);
});
