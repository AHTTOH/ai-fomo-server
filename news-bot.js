require('dotenv').config();

process.env.TZ = process.env.TZ || 'Asia/Seoul';

const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const { Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');

const parser = new Parser();

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const NEWS_CHANNEL_ID = process.env.NEWS_CHANNEL_ID || '';
const NEWS_CHANNEL_NAME = process.env.NEWS_CHANNEL_NAME || '🤖-ai-뉴스-자동봇';
const HISTORY_FILE = path.join(__dirname, 'news-history.json');
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_ALLOW_KEYWORDS = [
  'ai', 'llm', 'ml', 'gpt', 'agent', 'agents', 'rag', 'mcp',
  'openai', 'anthropic', 'claude', 'gemini', 'copilot', 'prompt',
  'inference', 'model', 'models', 'api', 'sdk', 'developer',
  'development', 'software', 'engineering', 'engineer', 'programming',
  'code', 'coding', 'database', 'cloud', 'infra', 'security', 'startup',
  'web', 'app', '앱', '개발', '개발자', '프로그래밍', '코드', '엔지니어',
  '소프트웨어', '오픈소스', '모델', '추론', '에이전트', '인공지능',
  '머신러닝', '스타트업', '보안', '데이터', '클라우드', '웹', '서비스',
];
const DAILY_BLOCK_KEYWORDS = [
  '호르무즈', '중동', '휴전', '전쟁', '공습', '군사', '외교', '선거',
  '정당', '대통령', '국회', '시위', '이란', '이스라엘', 'ukraine',
  'russia', 'gaza', 'iran', 'israel', 'ceasefire', 'election',
  'politics', 'war', 'military', 'hormuz', 'strait of hormuz',
  'middle east', 'geopolitics', 'geopolitical',
];

const SOURCE_META = {
  geeknews: {
    label: 'GeekNews',
    color: 0xff6600,
  },
  hackernews: {
    label: 'Hacker News',
    color: 0xffa500,
  },
  wikidocs: {
    label: 'WikiDocs',
    color: 0x22aa99,
  },
  itworld: {
    label: 'ITWorld Korea',
    color: 0x0077cc,
  },
};

const SOURCE_PRIORITY = {
  geeknews: 3,
  itworld: 2,
  wikidocs: 1,
};

const WIKIDOCS_BOOKS = [
  { id: '18346', title: 'AI 에이전트 개발' },
  { id: '19485', title: 'n8n AI 자동화 가이드' },
  { id: '19208', title: 'AI 도구 백과사전' },
  { id: '18896', title: '속성 Claude Code 실무 바이브코딩' },
];

const args = parseArgs(process.argv.slice(2));
const MODE = (args._[0] || process.env.NEWS_BOT_MODE || 'daily').toLowerCase();
const DRY_RUN = toBoolean(args['dry-run'], process.env.DRY_RUN);
const DAILY_LIMIT = toPositiveInteger(args['daily-limit'] || process.env.NEWS_DAILY_LIMIT, 3);
const WIKIDOCS_DAILY_LIMIT = toPositiveInteger(
  args['wikidocs-limit'] || process.env.WIKIDOCS_DAILY_LIMIT,
  2,
);
const ITWORLD_DAILY_LIMIT = toPositiveInteger(
  args['itworld-limit'] || process.env.ITWORLD_DAILY_LIMIT,
  2,
);
const WIKIDOCS_MAX_AGE_DAYS = toPositiveInteger(
  args['wikidocs-max-age-days'] || process.env.WIKIDOCS_MAX_AGE_DAYS,
  14,
);
const ITWORLD_MAX_AGE_DAYS = toPositiveInteger(
  args['itworld-max-age-days'] || process.env.ITWORLD_MAX_AGE_DAYS,
  7,
);
const BACKFILL_WEEKS = toPositiveInteger(args.weeks || process.env.NEWS_BACKFILL_WEEKS, 16);
const BACKFILL_START_DATE = parseDateInput(args['start-date'] || process.env.NEWS_BACKFILL_START_DATE);
const BACKFILL_END_DATE = parseDateInput(args['end-date'] || process.env.NEWS_BACKFILL_END_DATE);
const HN_QUERY = String(args.query || process.env.HN_QUERY || 'AI');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      parsed._.push(token);
      continue;
    }

    const trimmed = token.slice(2);
    const [rawKey, rawValue] = trimmed.split('=');
    const key = rawKey.trim();

    if (!rawValue && index + 1 < argv.length && !argv[index + 1].startsWith('--')) {
      parsed[key] = argv[index + 1];
      index += 1;
      continue;
    }

    parsed[key] = rawValue === undefined ? true : rawValue;
  }

  return parsed;
}

function toBoolean(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
      return false;
    }
  }

  return false;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid date: ${value}. Use YYYY-MM-DD.`);
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function truncate(text, maxLength) {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function normalizeText(text) {
  return String(text || '').toLowerCase();
}

function hasKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function shouldIncludeDailyItem(item) {
  const haystack = [item.title, item.contentSnippet, item.content, item.summary]
    .filter(Boolean)
    .join(' ');

  if (hasKeyword(haystack, DAILY_BLOCK_KEYWORDS)) {
    return false;
  }

  return hasKeyword(haystack, DAILY_ALLOW_KEYWORDS);
}

function decodeHtml(text) {
  if (!text) {
    return '';
  }

  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripHtml(text) {
  return decodeHtml(String(text || ''))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function absoluteUrl(base, value) {
  try {
    return new URL(value, base).toString();
  } catch (error) {
    return value;
  }
}

function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function isRecentEnough(value, maxAgeDays) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return timestamp >= Date.now() - maxAgeDays * DAY_MS;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + offset);
  return next;
}

function endOfWeek(date) {
  const end = addDays(startOfWeek(date), 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getWeekLabel(labelDate) {
  const anchor = new Date(labelDate);
  anchor.setHours(0, 0, 0, 0);

  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const firstWeekStart = startOfWeek(monthStart);
  const currentWeekStart = startOfWeek(anchor);
  const weekIndex = Math.floor((currentWeekStart.getTime() - firstWeekStart.getTime()) / WEEK_MS) + 1;

  return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 ${weekIndex}주차`;
}

function buildRange(start, labelDate) {
  const rangeStart = startOfWeek(start);
  const rangeEnd = endOfWeek(start);
  const effectiveLabelDate = new Date(labelDate || rangeStart);
  const weekLabel = getWeekLabel(effectiveLabelDate);

  return {
    start: rangeStart,
    end: rangeEnd,
    labelDate: effectiveLabelDate,
    weekLabel,
    label: `${weekLabel} (${formatDate(rangeStart)} ~ ${formatDate(rangeEnd)})`,
  };
}

function getRecentBackfillRanges(weeks) {
  const yesterday = addDays(new Date(), -1);
  const currentWeekStart = startOfWeek(yesterday);
  const firstRecentWeek = addDays(currentWeekStart, -7 * weeks);
  const ranges = [];

  for (let index = 0; index < weeks; index += 1) {
    const rangeStart = addDays(firstRecentWeek, index * 7);
    ranges.push(buildRange(rangeStart, rangeStart));
  }

  return ranges;
}

function getConfiguredBackfillRanges(startDate, endDate, weeks) {
  const ranges = [];
  let cursor = startOfWeek(startDate);
  const explicitEnd = endDate ? endOfWeek(endDate) : null;
  const computedEnd = explicitEnd || addDays(cursor, weeks * 7 - 1);

  while (cursor <= computedEnd) {
    const labelDate = ranges.length === 0 ? startDate : cursor;
    ranges.push(buildRange(cursor, labelDate));
    cursor = addDays(cursor, 7);
  }

  return ranges;
}

function getBackfillRanges() {
  if (!BACKFILL_START_DATE) {
    return getRecentBackfillRanges(BACKFILL_WEEKS);
  }

  if (BACKFILL_END_DATE && BACKFILL_START_DATE > BACKFILL_END_DATE) {
    throw new Error('NEWS_BACKFILL_START_DATE must be before NEWS_BACKFILL_END_DATE.');
  }

  return getConfiguredBackfillRanges(BACKFILL_START_DATE, BACKFILL_END_DATE, BACKFILL_WEEKS);
}

function loadState() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return createEmptyState();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

    if (Array.isArray(raw)) {
      return {
        version: 2,
        posted: {
          daily: dedupe(raw),
          backfill: [],
        },
      };
    }

    return {
      version: 2,
      posted: {
        daily: dedupe(raw?.posted?.daily || []),
        backfill: dedupe(raw?.posted?.backfill || []),
      },
    };
  } catch (error) {
    console.warn('Failed to parse history file. Recreating a clean state.', error.message);
    return createEmptyState();
  }
}

function createEmptyState() {
  return {
    version: 2,
    posted: {
      daily: [],
      backfill: [],
    },
  };
}

function dedupe(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function saveState(state) {
  const nextState = {
    version: 2,
    posted: {
      daily: state.posted.daily.slice(-2000),
      backfill: state.posted.backfill.slice(-3000),
    },
  };

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(nextState, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchText(url, timeoutMs = 20000) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'user-agent': 'ai-fomo-server/1.0',
        },
      });

      if (response.ok) {
        return await response.text();
      }

      if (response.status === 429 && attempt < 3) {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSeconds = Number.parseInt(retryAfterHeader || '0', 10);
        const waitMs = retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : (attempt + 1) * 2500;
        await sleep(waitMs);
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('Request failed after retries.');
}

async function parseRss(url) {
  const xml = await fetchText(url, 25000);
  return parser.parseString(xml);
}

async function getTargetChannel() {
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.channels.fetch();

  let channel = null;

  if (NEWS_CHANNEL_ID) {
    channel = guild.channels.cache.get(NEWS_CHANNEL_ID) || null;
  }

  if (!channel) {
    channel = guild.channels.cache.find(
      (candidate) => candidate.type === ChannelType.GuildText && candidate.name === NEWS_CHANNEL_NAME,
    );
  }

  if (!channel) {
    throw new Error(`Target channel not found: ${NEWS_CHANNEL_NAME}`);
  }

  if (typeof channel.send !== 'function') {
    throw new Error(`Target channel is not sendable: ${channel.name}`);
  }

  return channel;
}

function buildEmbed(entry) {
  const source = SOURCE_META[entry.source];
  const embed = new EmbedBuilder()
    .setColor(source.color)
    .setTitle(truncate(entry.title, 256))
    .setURL(entry.url)
    .setFooter({
      text: entry.footer || `${source.label}${entry.rangeLabel ? ` | ${entry.rangeLabel}` : ''}`,
    });

  if (entry.description) {
    embed.setDescription(truncate(entry.description, 4000));
  }

  const fields = [];

  if (entry.bucketLabel) {
    fields.push({
      name: '대표 기준',
      value: entry.bucketLabel,
      inline: true,
    });
  }

  if (entry.metricLabel) {
    fields.push({
      name: '지표',
      value: entry.metricLabel,
      inline: true,
    });
  }

  if (entry.note) {
    fields.push({
      name: '비고',
      value: entry.note,
      inline: true,
    });
  }

  if (entry.commentsUrl) {
    fields.push({
      name: '토론',
      value: `[댓글 보기](${entry.commentsUrl})`,
      inline: false,
    });
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  if (entry.publishedAt) {
    embed.setTimestamp(new Date(entry.publishedAt));
  }

  return embed;
}

async function postDailyEntries(channel, entries, state) {
  const posted = [];

  for (const entry of entries) {
    if (state.posted.daily.includes(entry.dedupeKey)) {
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run][daily] ${entry.source} :: ${entry.title}`);
    } else {
      await channel.send({ embeds: [buildEmbed(entry)] });
      state.posted.daily.push(entry.dedupeKey);
    }

    posted.push(entry);
  }

  return posted;
}

async function postBackfillGroups(channel, groups, state) {
  const posted = [];

  for (const group of groups) {
    const pendingEntries = group.entries.filter((entry) => !state.posted.backfill.includes(entry.dedupeKey));
    if (pendingEntries.length === 0) {
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run][backfill] ${group.label}`);
      pendingEntries.forEach((entry) => {
        console.log(`  - ${entry.source} :: ${entry.bucketLabel} :: ${entry.title}`);
      });
    } else {
      await channel.send({
        content: `백필 | ${group.label}`,
        embeds: pendingEntries.map(buildEmbed),
      });

      pendingEntries.forEach((entry) => {
        state.posted.backfill.push(entry.dedupeKey);
      });
    }

    posted.push(...pendingEntries);
  }

  return posted;
}

function parseHnMetrics(contentSnippet) {
  const snippet = String(contentSnippet || '');
  const pointsMatch = snippet.match(/Points:\s*(\d+)/i);
  const commentsMatch = snippet.match(/# Comments:\s*(\d+)/i);

  return {
    points: Number.parseInt(pointsMatch?.[1] || '0', 10),
    comments: Number.parseInt(commentsMatch?.[1] || '0', 10),
  };
}

function canonicalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const blockedParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'ref_src',
      'source',
      'src',
    ];

    blockedParams.forEach((key) => {
      parsed.searchParams.delete(key);
    });

    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();

    if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
      parsed.port = '';
    }

    if (parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }

    return parsed.toString();
  } catch (error) {
    return String(rawUrl || '').trim();
  }
}

function normalizeComparableTitle(title) {
  return normalizeText(title)
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9가-힣]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDuplicateDailyEntry(left, right) {
  const leftUrl = canonicalizeUrl(left.url);
  const rightUrl = canonicalizeUrl(right.url);
  if (leftUrl && rightUrl && leftUrl === rightUrl) {
    return true;
  }

  const leftTitle = normalizeComparableTitle(left.title);
  const rightTitle = normalizeComparableTitle(right.title);

  if (!leftTitle || !rightTitle) {
    return false;
  }

  if (leftTitle === rightTitle) {
    return true;
  }

  const shorterLength = Math.min(leftTitle.length, rightTitle.length);
  if (shorterLength < 24) {
    return false;
  }

  return leftTitle.includes(rightTitle) || rightTitle.includes(leftTitle);
}

function compareDailyEntryPreference(left, right) {
  const sourceDelta = (SOURCE_PRIORITY[right.source] || 0) - (SOURCE_PRIORITY[left.source] || 0);
  if (sourceDelta !== 0) {
    return sourceDelta;
  }

  const descriptionDelta = (right.description || '').length - (left.description || '').length;
  if (descriptionDelta !== 0) {
    return descriptionDelta;
  }

  return new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime();
}

function dedupeDailyEntries(entries) {
  const selected = [];

  for (const entry of entries) {
    const duplicateIndex = selected.findIndex((candidate) => isDuplicateDailyEntry(candidate, entry));
    if (duplicateIndex === -1) {
      selected.push(entry);
      continue;
    }

    if (compareDailyEntryPreference(selected[duplicateIndex], entry) < 0) {
      selected[duplicateIndex] = entry;
    }
  }

  return selected.sort(
    (left, right) => new Date(left.publishedAt || 0).getTime() - new Date(right.publishedAt || 0).getTime(),
  );
}

async function collectDailyGeekNews(limit) {
  const feed = await parseRss('https://news.hada.io/rss/news');

  return (feed.items || [])
    .filter(shouldIncludeDailyItem)
    .slice(0, limit)
    .reverse()
    .map((item) => ({
      dedupeKey: `daily:geeknews:${item.guid || item.id || item.link}`,
      source: 'geeknews',
      title: stripHtml(item.title),
      url: item.link,
      description: truncate(stripHtml(item.contentSnippet || item.content || item.summary || ''), 350),
      publishedAt: item.isoDate || item.pubDate || null,
      footer: 'GeekNews | latest feed',
    }));
}

async function collectDailyHackerNews(limit) {
  const feed = await parseRss(`https://hnrss.org/newest?q=${encodeURIComponent(HN_QUERY)}`);

  return (feed.items || [])
    .filter(shouldIncludeDailyItem)
    .slice(0, limit)
    .reverse()
    .map((item) => {
    const metrics = parseHnMetrics(item.contentSnippet);

    return {
      dedupeKey: `daily:hackernews:${item.guid || item.id || item.link}`,
      source: 'hackernews',
      title: stripHtml(item.title),
      url: item.link,
      description: truncate(stripHtml(item.contentSnippet || ''), 350),
      publishedAt: item.isoDate || item.pubDate || null,
      metricLabel: `${metrics.points} points · ${metrics.comments} comments`,
      commentsUrl: item.comments || null,
      footer: `Hacker News | newest "${HN_QUERY}"`,
    };
  });
}

async function collectDailyWikiDocs(limit) {
  const feeds = await Promise.all(
    WIKIDOCS_BOOKS.map(async (book) => {
      const feed = await parseRss(`https://wikidocs.net/book/${book.id}/rss/`);
      return { book, feed };
    }),
  );

  return feeds
    .flatMap(({ book, feed }) => {
      const bookTitle = stripHtml(feed.title || book.title);

      return (feed.items || []).map((item) => ({
        dedupeKey: `daily:wikidocs:${item.guid || item.id || item.link}`,
        source: 'wikidocs',
        title: stripHtml(item.title),
        url: item.link,
        description: truncate(`${bookTitle} 업데이트`, 350),
        contentSnippet: `${bookTitle} ${stripHtml(item.description || '')}`,
        publishedAt: item.isoDate || item.pubDate || null,
        footer: `WikiDocs | ${bookTitle}`,
      }));
    })
    .filter((item) => isRecentEnough(item.publishedAt, WIKIDOCS_MAX_AGE_DAYS))
    .filter(shouldIncludeDailyItem)
    .sort((left, right) => new Date(left.publishedAt || 0).getTime() - new Date(right.publishedAt || 0).getTime())
    .slice(-limit);
}

async function collectDailyItWorld(limit) {
  const feed = await parseRss('https://www.itworld.co.kr/artificial-intelligence/feed/');

  return (feed.items || [])
    .map((item) => ({
      dedupeKey: `daily:itworld:${item.guid || item.id || item.link}`,
      source: 'itworld',
      title: stripHtml(item.title),
      url: item.link,
      description: truncate(stripHtml(item.contentSnippet || item.content || item.summary || ''), 350),
      contentSnippet: stripHtml(item.categories?.join(' ') || ''),
      publishedAt: item.isoDate || item.pubDate || null,
      footer: 'ITWorld Korea | AI',
    }))
    .filter((item) => isRecentEnough(item.publishedAt, ITWORLD_MAX_AGE_DAYS))
    .filter(shouldIncludeDailyItem)
    .sort((left, right) => new Date(left.publishedAt || 0).getTime() - new Date(right.publishedAt || 0).getTime())
    .slice(-limit);
}

function parseGeekNewsPastPage(html, day) {
  const rows = [];
  const rowRegex =
    /<div class='topic_row'>[\s\S]*?<div class=votenum>(?<rank>\d+)<\/div>[\s\S]*?<div class=topictitle><a href='(?<url>[^']+)'[^>]*><h1>(?<title>[\s\S]*?)<\/h1><\/a>[\s\S]*?<div class='topicdesc'><a href='topic\?id=(?<topicId>\d+)'[^>]*>(?<description>[\s\S]*?)<\/a><\/div><div class='topicinfo'><span id='tp\d+'>(?<points>\d+)<\/span> points by [\s\S]*?\| <a href='topic\?id=\d+&go=comments' class=u>댓글 (?<comments>\d+)개<\/a><\/div><\/div>/g;

  for (const match of html.matchAll(rowRegex)) {
    rows.push({
      topicId: match.groups.topicId,
      title: stripHtml(match.groups.title),
      url: absoluteUrl('https://news.hada.io/', match.groups.url),
      description: truncate(stripHtml(match.groups.description), 320),
      points: Number.parseInt(match.groups.points, 10),
      comments: Number.parseInt(match.groups.comments, 10),
      attention: Number.parseInt(match.groups.points, 10) + Number.parseInt(match.groups.comments, 10) * 3,
      publishedAt: `${day}T12:00:00+09:00`,
      day,
    });
  }

  return rows;
}

async function fetchGeekNewsDay(day) {
  await sleep(500);
  let page = 1;
  const entries = [];

  while (true) {
    const suffix = page === 1 ? '' : `&page=${page}`;
    const url = `https://news.hada.io/past?day=${day}${suffix}`;
    const html = await fetchText(url, 25000);
    const rows = parseGeekNewsPastPage(html, day);
    entries.push(...rows);

    const hasNextPage = html.includes(`past?day=${day}&page=${page + 1}`);
    if (!hasNextPage || rows.length === 0) {
      break;
    }

    page += 1;
  }

  return entries;
}

async function collectGeekNewsBackfill(range) {
  const allEntries = [];
  let cursor = new Date(range.start);

  while (cursor <= range.end) {
    const day = formatDate(cursor);
    const entries = await fetchGeekNewsDay(day);
    allEntries.push(...entries);
    cursor = addDays(cursor, 1);
  }

  return allEntries;
}

function pickDistinctWinners(entries) {
  const definitions = [
    {
      bucketKey: 'attention',
      key: 'attention',
      bucketLabel: '주목도 1위',
      metricLabel: (entry) => `${entry.attention} attention score`,
      note: '조회수 공개값이 없어 공개 지표 proxy 사용',
    },
    {
      bucketKey: 'points',
      key: 'points',
      bucketLabel: '추천수 1위',
      metricLabel: (entry) => `${entry.points} points`,
      note: null,
    },
    {
      bucketKey: 'comments',
      key: 'comments',
      bucketLabel: '이슈 1위',
      metricLabel: (entry) => `${entry.comments} comments`,
      note: null,
    },
  ];

  const usedIds = new Set();
  const winners = [];

  for (const definition of definitions) {
    const sorted = [...entries].sort((left, right) => {
      const primary = (right[definition.key] || 0) - (left[definition.key] || 0);
      if (primary !== 0) {
        return primary;
      }

      return (right.points || 0) - (left.points || 0);
    });

    const winner = sorted.find((entry) => !usedIds.has(entry.storyId || entry.topicId));
    if (!winner) {
      continue;
    }

    usedIds.add(winner.storyId || winner.topicId);
    winners.push({
      ...winner,
      bucketKey: definition.bucketKey,
      bucketLabel: definition.bucketLabel,
      metricLabel: definition.metricLabel(winner),
      note: definition.note,
    });
  }

  return winners;
}

async function collectBackfillEntries(range) {
  const geekNewsEntries = await collectGeekNewsBackfill(range);

  const geekNewsWinners = pickDistinctWinners(geekNewsEntries).map((entry) => ({
    dedupeKey: `backfill:geeknews:${range.label}:${entry.bucketKey}:${entry.topicId}`,
    source: 'geeknews',
    title: entry.title,
    url: entry.url,
    description: entry.description,
    publishedAt: entry.publishedAt,
    bucketLabel: entry.bucketLabel,
    metricLabel: entry.metricLabel,
    note: entry.note,
    rangeLabel: range.label,
  }));

  return {
    label: range.label,
    entries: geekNewsWinners,
  };
}

async function runDaily(channel, state) {
  const [geekNewsEntries, wikiDocsEntries, itWorldEntries] = await Promise.all([
    collectDailyGeekNews(DAILY_LIMIT),
    collectDailyWikiDocs(WIKIDOCS_DAILY_LIMIT),
    collectDailyItWorld(ITWORLD_DAILY_LIMIT),
  ]);
  const orderedEntries = dedupeDailyEntries([...geekNewsEntries, ...wikiDocsEntries, ...itWorldEntries]);

  return postDailyEntries(channel, orderedEntries, state);
}

async function runBackfill(channel, state) {
  const ranges = getBackfillRanges();
  const groups = [];

  for (const range of ranges) {
    console.log(`Collecting backfill range ${range.label}...`);
    groups.push(await collectBackfillEntries(range));
  }

  return postBackfillGroups(channel, groups, state);
}

async function main() {
  if (!BOT_TOKEN || !GUILD_ID) {
    throw new Error('BOT_TOKEN and GUILD_ID must be set.');
  }

  if (!['daily', 'backfill'].includes(MODE)) {
    throw new Error(`Unsupported mode: ${MODE}`);
  }

  const state = loadState();
  const channel = await getTargetChannel();
  const posted = MODE === 'daily' ? await runDaily(channel, state) : await runBackfill(channel, state);

  if (!DRY_RUN) {
    saveState(state);
  }

  console.log(`${MODE} completed. posted=${posted.length} dryRun=${DRY_RUN}`);
}

client.once('clientReady', async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
});

client.login(BOT_TOKEN);
