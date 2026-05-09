const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once('ready', () => {
  console.log(`✅ AI Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

  // Ignore bots
  if (message.author.bot) return;

  // Ignore attachments/gifs/files/images
  if (message.attachments.size > 0) return;

  // Ignore embeds
  if (message.embeds.length > 0) return;

  // Ignore stickers
  if (message.stickers.size > 0) return;

  // Ignore empty messages
  if (!message.content?.trim()) return;

  const text = message.content.trim();

  // Ignore very short messages
  if (text.length < 4) return;

  // Ignore pure emoji messages
  const emojiOnly =
    /^[\p{Emoji}\s]+$/u.test(text);

  if (emojiOnly) return;

  // Ignore mentions only
  const mentionOnly =
    /^<@!?\d+>$/.test(text);

  if (mentionOnly) return;

  // Ignore messages with almost no letters
  const letters =
    text.match(/[a-zA-Zа-яА-Яء-يäöüß]/g);

  if (!letters || letters.length < 2) return;

  try {

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a live Discord translator.

DEFAULT BEHAVIOR:
- English -> Russian
- Russian -> English

MULTI LANGUAGE OVERRIDE:
If the LAST words contain language codes:
- en = English
- ru = Russian
- de = German
- ar = Arabic

Translate the message into ALL requested languages.

Examples:
"hello ru de"
-> 🇷🇺 Привет
-> 🇩🇪 Hallo

IMPORTANT RULES:
- Language codes are ALWAYS at the END.
- Remove language codes from final output.
- Keep slang, gaming terms, abbreviations and emotions natural.
- Ignore emojis and mentions naturally.
- ONLY return translated text.
- Put every translation on a new line.
`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    });

    const translated =
      response.choices[0].message.content?.trim();

    // Ignore empty replies
    if (!translated) return;

    // Ignore identical replies
    if (
      translated.toLowerCase() ===
      text.toLowerCase()
    ) return;

    await message.reply(translated);

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(process.env.TOKEN);
