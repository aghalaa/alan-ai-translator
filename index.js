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

    const parts = message.content.trim().split(" ");
    const lastWord = parts[parts.length - 1].toLowerCase();

    const supported = ["ru", "en", "ar", "de"];

    let cleanMessage = message.content;

    if (supported.includes(lastWord)) {
      cleanMessage = parts.slice(0, -1).join(" ");
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
`You are a live Discord translator.

Default behavior:
- If message is English -> translate to Russian.
- If message is Russian -> translate to English.

Special override:
If the LAST word of the message is a language code:
- en = English
- ru = Russian
- ar = Arabic
- de = German

Then translate the message into that language instead.

IMPORTANT:
- The language code is always the LAST word.
- Remove the language code from the final output.
- Keep slang, gaming terms, abbreviations, and emotions natural.
- Only return the translated message.`
        },
        {
          role: 'user',
          content: cleanMessage
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
