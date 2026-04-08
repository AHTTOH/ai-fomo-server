require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        await guild.channels.fetch();
        
        const channel = guild.channels.cache.find(c => c.name === '🟡-중급-심화과정');
        
        if (!channel) {
            console.log('Channel not found.');
            return;
        }

        if (channel.type !== ChannelType.GuildForum) {
            console.log(`Channel is not a forum. Actual type: ${channel.type}, Expected: ${ChannelType.GuildForum}`);
            // If it's not a forum, we can't create a thread in the forum sense.
            // But user wants to use it as a forum.
            // Maybe they need to refresh their view?
        } else {
            console.log('Channel is a forum! Creating post...');
            const thread = await channel.threads.create({
                name: 'google antigravity 자동 승인 꿀팁',
                message: {
                    content: `ctrl+shift+P눌러서 Toggle Developer Tools 켠 다음에 Console에 아래 내용 입력

\`\`\`javascript
setInterval(() => { 
    const buttons = Array.from(document.querySelectorAll('button')); 
    const acceptBtn = buttons.find(b => b.textContent.includes('Accept') || b.textContent.includes('Run') || b.textContent.includes('Always Allow')); 
    if(acceptBtn) acceptBtn.click(); 
}, 1500);
\`\`\`

(Always Allow를 자동으로 눌러주는 스크립트)`
                }
            });
            console.log('Successfully created post!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.destroy();
    }
});

client.login(process.env.BOT_TOKEN);
