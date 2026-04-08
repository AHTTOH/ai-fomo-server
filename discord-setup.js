require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const STRUCTURE = [
  {
    name: "📌 운영",
    channels: [
      { name: "📢-공지사항", type: ChannelType.GuildText, everyoneReadOnly: true },
      { name: "🎉-환영합니다", type: ChannelType.GuildText },
      { name: "📋-서버-이용규칙", type: ChannelType.GuildText, everyoneReadOnly: true },
      { name: "🙋-자기소개", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🔥 AI 트렌드",
    channels: [
      { name: "🤖-ai-뉴스-자동봇", type: ChannelType.GuildText },
      { name: "💬-트렌드-토론", type: ChannelType.GuildText },
      { name: "🏆-이-주의-AI툴", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🛠️ AI 실습",
    channels: [
      { name: "💡-프롬프트-공유", type: ChannelType.GuildText },
      { name: "🎨-이미지-생성-갤러리", type: ChannelType.GuildText },
      { name: "📝-업무-자동화-팁", type: ChannelType.GuildText },
      { name: "🤖-봇-테스트", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🏫 AI 튜토리얼",
    channels: [
      { name: "🟢-초급-가이드", type: ChannelType.GuildText },
      { name: "🟡-중급-심화과정", type: ChannelType.GuildText },
      { name: "🔴-고급-프로젝트", type: ChannelType.GuildText }
    ]
  },
  {
    name: "📖 자료창고",
    channels: [
      { name: "🔗-유용한-링크-모음", type: ChannelType.GuildText },
      { name: "📄-강의-스터디-자료", type: ChannelType.GuildText },
      { name: "❓-qna", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🗓️ 모임",
    channels: [
      { name: "📅-모임-공지-및-후기", type: ChannelType.GuildText },
      { name: "🎤-발표-자료-아카이브", type: ChannelType.GuildText },
      { name: "🗳️-투표-설문", type: ChannelType.GuildText }
    ]
  },
  {
    name: "💬 커뮤니티",
    channels: [
      { name: "💬-자유-잡담", type: ChannelType.GuildText },
      { name: "😂-ai-짤-밈", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🎙️ 음성채널",
    channels: [
      { name: "🔊 스터디룸-1", type: ChannelType.GuildVoice },
      { name: "🔊 스터디룸-2", type: ChannelType.GuildVoice },
      { name: "🎤 발표-세미나홀", type: ChannelType.GuildVoice }
    ]
  }
];

const ROLES = [
  { name: "🛡️ 운영진", color: "#FFD700", permissions: [PermissionFlagsBits.Administrator] },
  { name: "🤖 봇마스터", color: "#00BFFF", permissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles] },
  { name: "🌱 멤버", color: "#32CD32", permissions: [] },
  { name: "👀 게스트", color: "#808080", permissions: [] }
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) {
      console.log('Guild not found. (Make sure the bot is invited to the server!)');
      return;
    }

    console.log('Setting up roles...');
    for (const roleData of ROLES) {
      const existingRole = guild.roles.cache.find(r => r.name === roleData.name);
      if (!existingRole) {
        await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          permissions: roleData.permissions,
          reason: 'Auto setup roles'
        });
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }

    console.log('Setting up channels...');
    for (const categoryData of STRUCTURE) {
      let category = guild.channels.cache.find(c => c.name === categoryData.name && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = await guild.channels.create({
          name: categoryData.name,
          type: ChannelType.GuildCategory
        });
        console.log(`Created category: ${categoryData.name}`);
      }

      for (const channelData of categoryData.channels) {
        const existingChannel = guild.channels.cache.find(c => c.name === channelData.name && c.parentId === category.id);
        if (!existingChannel) {
          const permissionOverwrites = [];
          
          if (channelData.everyoneReadOnly) {
            permissionOverwrites.push({
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.SendMessages],
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
            });
          }

          await guild.channels.create({
            name: channelData.name,
            type: channelData.type,
            parent: category.id,
            permissionOverwrites: permissionOverwrites.length > 0 ? permissionOverwrites : undefined
          });
          console.log(`Created channel: ${channelData.name}`);
        } else {
          console.log(`Channel already exists: ${channelData.name}`);
        }
      }
    }
    
    console.log('Setup finished successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    client.destroy();
  }
});

client.login(BOT_TOKEN);
