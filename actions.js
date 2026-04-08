require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    
    // 1. Delete duplicate '🏆-이-주의-AI툴'
    // Also checking for '🏆-이-주의-ai툴' as Discord lowercase channels
    const toolChannels = guild.channels.cache.filter(c => 
      c.name.includes('이-주의-ai툴') || c.name.includes('이-주의-ai')
    );
    
    if (toolChannels.size > 1) {
      console.log(`Found ${toolChannels.size} tool channels. Keeping one, deleting the rest...`);
      const arr = Array.from(toolChannels.values());
      // Delete from 2nd onwards
      for (let i = 1; i < arr.length; i++) {
        await arr[i].delete();
        console.log(`Deleted duplicate channel id ${arr[i].id} (${arr[i].name})`);
      }
    } else {
      console.log(`Found ${toolChannels.size} tool channels. No duplicates to delete.`);
    }

    // 2. Send announcement
    const announceChannel = guild.channels.cache.find(c => c.name.includes('공지사항'));
    if (announceChannel) {
      const messages = await announceChannel.messages.fetch({ limit: 10 });
      const alreadySent = messages.some(m => m.embeds.length > 0 && m.embeds[0].title && m.embeds[0].title.includes("AI FOMO"));
      
      if (!alreadySent) {
        const welcomeEmbed = {
          color: 0x0099ff,
          title: '🎉 환영합니다! AI FOMO 동호회 디스코드에 오신 것을 환영합니다! 🎉',
          description: `안녕하세요! **AI FOMO 동호회** 공식 디스코드 서버입니다.
이곳은 우리가 다함께 **AI Native**가 되기 위해 신나게 학습하고 공유하는 공간입니다. 🚀

**📢 기본 운영 방침**
> 📱 **카카오톡 단톡방**에는 가장 핵심적인 중요 공지만 올라갑니다.
> 📚 그 외의 **모든 학습 자료 공유, 일정 관리, 질문/토론, 봇 실습 등은 전부 이곳(디스코드)에서 진행**됩니다.
> 🙋 처음 가입하신 분들은 \`🙋-자기소개\` 채널에 간단히 인사를 남겨주시면 감사하겠습니다!

메뉴나 채널이 처음엔 낯설 수 있지만, 계속 만지다 보면 금방 적응되실 겁니다.
모두 열심히 학습해서 다함께 AI 트렌드를 리드해보아요! 🔥`,
          timestamp: new Date().toISOString()
        };
        await announceChannel.send({ embeds: [welcomeEmbed] });
        console.log('Announcement sent to ' + announceChannel.name);
      } else {
        console.log('Announcement already sent in ' + announceChannel.name);
      }
    } else {
      console.log('Announcement channel not found.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    client.destroy();
  }
});

client.login(process.env.BOT_TOKEN);
