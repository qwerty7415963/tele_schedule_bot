import { Telegraf } from 'telegraf'
import 'dotenv/config'
import schedule from 'node-schedule'
import express from 'express'
const PORT = process.env.PORT || 3000

const app = express()

let blockChatJob
let unblockChatJob

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

// Admin user IDs
const ADMINS = process.env.ADMIN_ID
const chatPermissions = {
    can_send_messages: true,
    can_send_photos: true,
    can_send_media_messages: true,
    can_send_polls: false,
    can_send_audios: false,
    can_send_video_notes: false,
    can_send_voice_notes: false,
    can_send_documents: false,
    can_add_web_page_previews: false,
    // can_send_other_messages: true, // This allows stickers and GIFs
}

app.get('*', function (req, res) {
    res.send('Live')
})

bot.command('check', (ctx) => ctx.reply('is alive'))

bot.command('lock', (ctx) =>
    ctx.setChatPermissions({
        can_send_messages: false,
    })
)
bot.command('unlock', (ctx) =>
    ctx.setChatPermissions({
        can_send_messages: true,
        can_send_photos: true,
        can_send_media_messages: true,
        can_send_polls: false,
        can_send_audios: false,
        can_send_video_notes: false,
        can_send_voice_notes: false,
        can_send_documents: false,
        can_add_web_page_previews: false,
        // can_send_other_messages: true, // This allows stickers and GIFs
    })
)

bot.command('scheduleMute', (ctx) => {
    const messagePermissions = {
        can_send_messages: false,
    }

    // Check if user is admin
    if (ADMINS !== ctx.from.id.toString()) {
        return ctx.reply('Only admins can use this command')
    }

    // If jobs already exist, cancel them
    if (blockChatJob) {
        blockChatJob.cancel()
    }

    if (unblockChatJob) {
        unblockChatJob.cancel()
    }

    // Schedule chat block everyday at 12 PM
    blockChatJob = schedule.scheduleJob('0 0 * * *', () => {
        ctx.setChatPermissions({
            can_send_messages: false,
        })
    })

    // Schedule chat unblock everyday at 6 AM
    unblockChatJob = schedule.scheduleJob('0 6 * * *', () => {
        ctx.setChatPermissions({
            can_send_messages: true,
        })
    })

    ctx.reply('Daily mute scheduled!')
})

bot.launch()

app.listen(PORT, () => {
    console.log('Server listenning on PORT', PORT)
})
