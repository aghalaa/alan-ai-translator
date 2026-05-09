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

  // ignore bots
  if (message.author.bot) return;

  // ignore gifs/images/files
  if (message.attachments.size > 0) return;

  // ignore embeds/gifs
  if (message.embeds.length > 0) return;

  // ignore empty messages
  if (!message.content?.trim()) return;

  // ignore tiny fragments
  if (message.content.trim().length < 4) return;

  try {

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
`You are a live Discord translator.

DEFAULT RULES:
- English messages -> Russian
- Russian messages -> English

SPECIAL LANGUAGE OVERRIDE:
If the LAST word is:
- ru = translate to Russian
- en = translate to English
- de = translate to German
- ar = translate to Arabic

Examples:
"Hello de" -> "Hallo"
"مرحبا en" -> "Hello"

IMPORTANT:
- The last word can be a language code.
- REMOVE the language code from the final translation.
- Keep slang, gaming terms, abbreviations, and emotions natural.
- ONLY return translated text.`
        },
        {
          role: 'user',
          content: message.content
        }
      ],
      temperature: 0.3
    });

    const translated =
      response.choices[0].message.content;

    await message.reply(translated);

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(process.env.TOKEN);
