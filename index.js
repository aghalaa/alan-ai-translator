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
`You are a live translator between English and Russian.

If message is Russian → translate to English.
If message is English → translate to Russian.

Keep the translation natural and casual.
Keep slang and emotions natural.
Only return the translated message.`
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
