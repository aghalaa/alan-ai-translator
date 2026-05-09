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
  if (message.author.bot) return;
  if (!message.content) return;

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