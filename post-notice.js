require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        console.log('Connected to Discord. Fetching guild...');
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        
        // Notice Channel
        const noticeChannel = guild.channels.cache.find(c => c.name === '📢-공지사항');
        if (noticeChannel) {
            const noticeEmbed = new EmbedBuilder()
                .setTitle('🚀 AI FOMO 서버 "커뮤니티" 전환 안내')
                .setColor('#5865F2')
                .setDescription(
                    '지식베이스 문서 관리 및 자료 공유를 더 효율적으로 하기 위해 **"포럼(Forum)"** 기능을 도입했습니다!\n\n' +
                    '**✅ 주요 변경 사항**\n' +
                    '1. **포럼 도입**: `📖 지식자료실` 카테고리에서 주제별로 게시글을 남길 수 있습니다.\n' +
                    '2. **이메일 인증**: 커뮤니티 설정상 대화 시 **이메일 인증**이 필요할 수 있으니, 메시지 전송이 안 될 경우 인증을 완료해 주세요.\n\n' +
                    '**💡 우리끼리 쓰는 팁**\n' +
                    '우리 친구들끼리 편하게 대화하는 동호회인 만큼 빡빡한 규칙은 없습니다. 다만 **자료 정리용 포럼**은 나중에 검색하기 좋게 각자 잘 활용해 봅시다!'
                )
                .setTimestamp();
            await noticeChannel.send({ embeds: [noticeEmbed] });
            console.log('Notice posted to 📢-공지사항.');
        } else {
            console.warn('Notice channel not found.');
        }

        // Rules/Info Channel
        const rulesChannel = guild.channels.cache.find(c => c.name === '📋-서버-이용규칙');
        if (rulesChannel) {
            const rulesEmbed = new EmbedBuilder()
                .setTitle('📋 AI FOMO 아지트 가이드')
                .setColor('#2ECC71')
                .addFields(
                    { name: '1. 목적', value: 'AI 관련 트렌드 공유 및 실습 결과물 아카이빙' },
                    { name: '2. 포럼 게시판 활용', value: '`학습 가이드`, `유용한 링크`, `업무 자동화 사례` 등 주제별 포럼을 적극 활용해 주세요.' },
                    { name: '3. 자유로운 소통', value: '친구들끼리니까 격식 없이 편하게 소통합시다! 하지만 정보는 소중하니까 잘 정리해 둬요.' }
                )
                .setFooter({ text: 'AI FOMO | 지식 창고로 가꿔봅시다!' });
            await rulesChannel.send({ embeds: [rulesEmbed] });
            console.log('Server info posted to 📋-서버-이용규칙.');
        } else {
            console.warn('Rules channel not found.');
        }

        console.log('All notices posted successfully!');
    } catch (error) {
        console.error('Error posting notices:', error);
    } finally {
        client.destroy();
    }
});

client.login(process.env.BOT_TOKEN);
