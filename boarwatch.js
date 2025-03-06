require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const requiredEnvVars = ['TOKEN', 'BOT', 'SERVER', 'CHANNEL', 'PING'];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

//check logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

function logToFile(message) {
    const logFile = path.join(logsDir, `${new Date().getDate()}. ${new Date().getMonth()+1}. ${new Date().getFullYear()}.log`);
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(logFile, logMessage, 'utf8');
    console.log(logMessage.trim());
}

// alternative logToFile function with only one log file
//function logToFile(message) {
//    const logFile = path.join(logsDir, `boar.log`);
//    const timestamp = new Date().toLocaleString();
//    const logMessage = `[${timestamp}] ${message}\n`;
//    
//    fs.appendFileSync(logFile, logMessage, 'utf8');
//    console.log(logMessage.trim());
//}

client.once('ready', () => {
    logToFile(`Now watching BoarBot!`);

    client.user.setActivity({
        name: 'BoarBot',
        type: ActivityType.Watching
    });
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

    if (newStatus === 'offline') {
        logToFile(`BoarBot went offline`);

        const channel = client.channels.cache.get(process.env.CHANNEL);

        if (channel) {
            channel.send(`<@${process.env.PING}> BoarBot just went offline!`);
        } else {
            logToFile(`Channel not found`);
        }
    } else if (oldStatus === 'offline' && newStatus === 'online') {
        logToFile(`BoarBot went online`);

        const channel = client.channels.cache.get(process.env.CHANNEL);

        if (channel) {
            channel.send(`BoarBot is back online!`);
        } else {
            logToFile(`Channel not found`);
        }
    }

});

client.login(process.env.TOKEN).catch(error => {
    logToFile('Unable to login:', error);
    console.error('Unable to login:', error);
});
