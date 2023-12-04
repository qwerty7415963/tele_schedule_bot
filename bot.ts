import { Telegraf } from 'telegraf'
import 'dotenv/config'
import schedule from 'node-schedule'

let blockChatJob: any
let unblockChatJob: any

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

// Admin user IDs
const ADMINS = [5544828606]

bot.command('scheduleMute', (ctx) => {
    // Check if user is admin
    if (!ADMINS.includes(ctx.from.id)) {
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

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
