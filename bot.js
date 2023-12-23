import { Telegraf } from 'telegraf'
import 'dotenv/config'
import schedule from 'node-schedule'
import express from 'express'
import { scriptLock, scriptUnlock } from './scripts/index.js'
const PORT = process.env.PORT || 3000

const app = express()

let blockChatJob
let unblockChatJob

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

// Admin user IDs
const ADMINS = process.env.ADMIN_ID

app.get('*', function (req, res) {
    res.send('Live')
})

bot.command('check', (ctx) => ctx.reply('live'))

bot.command('scheduleMute', (ctx) => {
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
        ctx.reply(scriptLock, { parse_mode: 'HTML' }).then(() => {
            ctx.setChatPermissions({
                can_send_messages: false,
            })
        })
    })

    // Schedule chat unblock everyday at 6 AM
    unblockChatJob = schedule.scheduleJob('0 6 * * *', () => {
        ctx.reply(scriptUnlock, { parse_mode: 'HTML' }).then(() => {
            ctx.setChatPermissions(
                {
                    can_send_messages: true,
                    can_send_photos: true,
                    can_send_other_messages: true,
                    can_send_audios: false,
                    can_send_videos: false,
                    can_send_documents: false,
                    can_send_video_notes: false,
                    can_send_video_notes: false,
                    can_send_voice_notes: false,
                    can_send_polls: false,
                    can_add_web_page_previews: false,
                    can_manage_topics: false,
                    can_change_info: false,
                    can_pin_messages: false,
                },
                {
                    use_independent_chat_permissions: true,
                }
            )
        })
    })

    ctx.reply('Daily mute scheduled!')
})

bot.launch()

app.listen(PORT, () => {
    console.log('Server listenning on PORT', PORT)
})
