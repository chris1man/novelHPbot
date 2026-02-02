console.error('SERVER STARTING: Initializing application...');

process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
});

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const connectDB = require('./db');
const User = require('./models/User');
const scenes = require('./scenes');

// Connect to database
connectDB();

if (!process.env.BOT_TOKEN) {
    console.error('Error: BOT_TOKEN is not defined.');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Helper Functions ---

// Function to render a scene
async function renderScene(ctx, sceneId, user) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error(`Scene not found: ${sceneId}`);
        return ctx.reply("Ошибка: Сцена не найдена.");
    }

    // Handle Logic Transition Scenes (Auto-jump)
    if (scene.type === 'logic_transition') {
        const nextId = scene.nextScene(user);
        // Save the new scene before recursing
        user.currentScene = nextId;
        await user.save();
        return renderScene(ctx, nextId, user);
    }

    // Build Keyboard
    const buttons = [];
    if (scene.buttons) {
        scene.buttons.forEach(btn => {
            buttons.push([Markup.button.callback(btn.text, btn.callback_data)]);
        });
    }

    // Send Message
    // NOTE: To edit message instead of sending new one, we could use try-catch on editMessageText
    // But for a novel, keeping history is often better, or we can delete previous.
    // Here we will just send new message for simplicity and history.
    await ctx.reply(scene.text, Markup.inlineKeyboard(buttons));

    // Update user state (redundant if we save on transition, but good for safety)
    if (user.currentScene !== sceneId) {
        user.currentScene = sceneId;
        await user.save();
    }
}

// --- Middleware & Commands ---

// Helper to get or create user
async function getUser(ctx) {
    const telegramId = ctx.from.id;
    let user = await User.findOne({ telegramId });
    if (!user) {
        user = await User.create({
            telegramId,
            firstName: ctx.from.first_name,
            currentScene: 'scene_1'
        });
    }
    return user;
}

bot.start(async (ctx) => {
    try {
        const user = await getUser(ctx);
        // Reset user for new game if needed, or just resume
        // For /start, let's reset to scene 1 if requested or if new
        // Check if argument 'reset' is passed or just force start scene 1
        user.currentScene = 'scene_1';
        user.stats = { closeness: 0, darkness: 0, trust: 0 };
        user.flags = [];
        user.house = null;
        await user.save();

        await ctx.reply(`Добро пожаловать в "Змею" (Visual Novel Bot).`);
        await renderScene(ctx, 'scene_1', user);
    } catch (err) {
        console.error('Error in start:', err);
        ctx.reply('Произошла ошибка при запуске.');
    }
});

bot.on('callback_query', async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        const user = await getUser(ctx);
        const currentSceneId = user.currentScene;
        const currentScene = scenes[currentSceneId];

        if (!currentScene) {
            return ctx.reply('Сцена не найдена или устаревшая сессия. Напишите /start');
        }

        // Find the button definition that was clicked
        const button = currentScene.buttons ? currentScene.buttons.find(b => b.callback_data === callbackData) : null;

        if (button) {
            // 1. Apply Effects
            if (button.effects) {
                button.effects(user);
                // Mongoose doesn't always detect deep object changes, mark modified
                user.markModified('stats');
                user.markModified('flags');
            }

            // 2. Determine Next Scene
            let nextSceneId = button.nextScene;
            if (typeof nextSceneId === 'function') {
                nextSceneId = nextSceneId(user);
            }

            // 3. Save User State
            user.currentScene = nextSceneId;
            await user.save();

            // 4. Render Next Scene
            await ctx.answerCbQuery(); // Stop loading animation
            await renderScene(ctx, nextSceneId, user);
        } else {
            await ctx.answerCbQuery("Неизвестное действие.");
        }

    } catch (err) {
        console.error('Error in callback_query:', err);
        ctx.answerCbQuery('Произошла ошибка.');
    }
});

// Launch bot
bot.launch().then(() => {
    console.log('Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Health check server
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Bot is running!');
    res.end();
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Health check server running on port ${PORT}`);
});
