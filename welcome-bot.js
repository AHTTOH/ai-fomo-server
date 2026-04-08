require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// 신규 유저 감지를 위해 GuildMembers 인텐트가 필요합니다.
// (디스코드 개발자 포털에서 Server Members Intent를 켜주셔야 합니다)
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers // 멤버 가입 이벤트(guildMemberAdd)를 위해 필수
  ] 
});

client.once('ready', () => {
  console.log(`봇 로그인 완료: ${client.user.tag}`);
  console.log(`[환영 봇] 신규 멤버 감지를 시작합니다...`);
});

// 새로운 멤버가 서버에 들어왔을 때 발생하는 이벤트
client.on('guildMemberAdd', async member => {
  console.log(`신규 멤버 접속 감지: ${member.user.tag}`);
  
  try {
    // 환영합니다 채널 찾기
    const welcomeChannel = member.guild.channels.cache.find(c => c.name.includes('환영합니다'));
    
    if (welcomeChannel) {
      // 띄워줄 환영 메시지 양식 (예쁜 Embed 카드 형태)
      const welcomeEmbed = {
        color: 0xffd700, // 황금색
        title: '🎉 환영합니다! 🎉',
        description: `안녕하세요 <@${member.user.id}>님! **AI FOMO 동호회**에 오신 것을 진심으로 환영합니다. 🚀\n\n먼저 \`🙋-자기소개\` 채널에서 간단히 인사를 남겨주시고, 다른 멤버들과 즐겁게 소통해보세요!`,
        thumbnail: {
          url: member.user.displayAvatarURL({ dynamic: true })
        },
        footer: { text: "AI FOMO Bot" },
        timestamp: new Date().toISOString()
      };
      
      // 환영 채널로 메시지 전송
      await welcomeChannel.send({ 
        content: `Welcome <@${member.user.id}>! 👋`,
        embeds: [welcomeEmbed] 
      });
      console.log(`환영 메시지 전송 성공! (${member.user.tag})`);
    } else {
      console.log('환영합니다 채널을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('환영 메시지 전송 중 오류 발생:', error);
  }
});

client.login(BOT_TOKEN);
