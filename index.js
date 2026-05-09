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

  // Ignore gifs/images/files
  if (message.attachments.size > 0) return;

  // Ignore embeds
  if (message.embeds.length > 0) return;

  // Ignore empty messages
  if (!message.content?.trim()) return;

  // Ignore tiny messages
  if (message.content.trim().length < 2) return;

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

"مرحبا en de"
-> 🇬🇧 Hello
-> 🇩🇪 Hallo

IMPORTANT RULES:
- Language codes are ALWAYS at the END.
- Remove language codes from the final output.
- Keep slang, abbreviations, gaming language and emotions natural.
- ONLY return translations.
- Put each translation on a new line.
`
        },
        {
          role: 'user',
          content: message.content
        }
      ],
      temperature: 0.3
    });

    const translated =
      response.choices[0].message.content?.trim();

    if (!translated) return;

    await message.reply(translated);

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(process.env.TOKEN);
