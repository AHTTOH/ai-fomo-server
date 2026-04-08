require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const STRUCTURE = [
  {
    name: "📌 운영",
    channels: [
      { name: "📢-공지사항", type: ChannelType.GuildText, everyoneReadOnly: true },
      { name: "📋-서버-이용규칙", type: ChannelType.GuildText, everyoneReadOnly: true },
      { name: "🙋-자기소개", type: ChannelType.GuildText }
    ]
  },
  {
    name: "📚 튜토리얼 및 자료",
    channels: [
      { name: "🔗-유용한-링크-모음", type: ChannelType.GuildForum },
      { name: "📄-강의-스터디-자료", type: ChannelType.GuildForum },
      { name: "🟢-초급-가이드", type: ChannelType.GuildForum },
      { name: "🟡-중급-심화과정", type: ChannelType.GuildForum },
      { name: "🔴-고급-프로젝트", type: ChannelType.GuildForum },
      { name: "❓-qna", type: ChannelType.GuildForum }
    ]
  },
  {
    name: "🔥 AI 트렌드",
    channels: [
      { name: "🤖-ai-뉴스-자동봇", type: ChannelType.GuildText },
      { name: "💬-트렌드-토론", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🛠️ AI 실습",
    channels: [
      { name: "💡-프롬프트-공유", type: ChannelType.GuildText },
      { name: "🛠️-실습사례-공유", type: ChannelType.GuildText }
    ]
  },
  {
    name: "🗓️ 모임",
    channels: [
      { name: "📅-모임-공지-및-후기", type: ChannelType.GuildText },
      { name: "🎤-발표-자료-아카이브", type: ChannelType.GuildText }
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

client.once('ready', async () => {
  try {
    console.log('Pinging Discord server...');
    const guild = await client.guilds.fetch(GUILD_ID);

    // Process STRUCTURE
    const allowedCategoryNames = new Set(STRUCTURE.map(c => c.name));
    const allowedChannelNames = new Set();
    
    // We will collect position updates to prevent rate limits
    const positionUpdates = [];
    let catPos = 0;
    
    for (const catData of STRUCTURE) {
      let category = guild.channels.cache.find(c => c.name === catData.name && c.type === ChannelType.GuildCategory);
      if (!category) {
        // Create new category
        category = await guild.channels.create({ name: catData.name, type: ChannelType.GuildCategory });
        console.log(`Created category: ${catData.name}`);
      }
      
      positionUpdates.push({ channel: category.id, position: catPos });
      catPos++;

      let chPos = 0;
      for (const chData of catData.channels) {
        allowedChannelNames.add(chData.name);
        
        let channel = guild.channels.cache.find(c => c.name === chData.name);
        if (!channel || channel.type !== chData.type) {
          if (channel) {
            console.log(`Type mismatch for ${chData.name} (Existing: ${channel.type}, Target: ${chData.type}). Recreating...`);
            await channel.delete();
          }
          const permissionOverwrites = [];
          
          // Role for Moderator
          const modRole = guild.roles.cache.find(r => r.name === "🛡️ 운영진");

          if (chData.everyoneReadOnly) {
            permissionOverwrites.push({
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.SendMessages],
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
            });
          }

          if (chData.modOnly && modRole) {
            permissionOverwrites.push({
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            });
            permissionOverwrites.push({
              id: modRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            });
          }

          channel = await guild.channels.create({
            name: chData.name,
            type: chData.type,
            parent: category.id,
            permissionOverwrites: permissionOverwrites.length > 0 ? permissionOverwrites : undefined
          });
          console.log(`Created channel: ${chData.name} (${chData.type === ChannelType.GuildForum ? 'FORUM' : 'TEXT'})`);
        } else {
          // If it exists and types match, ensure it's in the correct category
          if (channel.parentId !== category.id) {
            await channel.setParent(category.id);
            console.log(`Moved channel ${chData.name} to category ${catData.name}`);
          }
        }
        positionUpdates.push({ channel: channel.id, position: chPos });
        chPos++;
      }
    }

    // Apply Position Updates safely using bulk API
    console.log('Applying layout reordering...');
    try {
      await guild.channels.setPositions(positionUpdates);
      console.log('Channel positions updated.');
    } catch(err) {
      console.error('Error updating positions:', err);
    }

    // Delete Unwanted Channels
    const allChannels = Array.from(guild.channels.cache.values());
    for (const channel of allChannels) {
      // Skip threads (forum posts)
      if (channel.isThread()) continue;

      if (channel.type === ChannelType.GuildCategory) {
        if (!allowedCategoryNames.has(channel.name)) {
          console.log(`Deleting Category: ${channel.name}`);
          try { await channel.delete(); } catch(e) { }
        }
      } else {
        if (!allowedChannelNames.has(channel.name)) {
          console.log(`Deleting Channel: ${channel.name}`);
          try { await channel.delete(); } catch(e) { }
        }
      }
    }

    console.log('Sync finished successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    client.destroy();
  }
});
client.login(process.env.BOT_TOKEN);
