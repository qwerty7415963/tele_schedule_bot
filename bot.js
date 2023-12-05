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
const ADMINS = [5544828606, 6747207838]

app.get('*', function (req, res) {
    res.send('Live')
})

bot.command('check', (ctx) => ctx.reply('is alive'))

bot.command('scheduleMute', (ctx) => {
    const today = new Date()
    const timeNow = `${today.getHours()} - ${today.getMinutes()} - ${today.getSeconds()}`

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
        ctx.reply('mở mõm' + timeNow)
        ctx.setChatPermissions({
            can_send_messages: false,
        })
    })

    // Schedule chat unblock everyday at 6 AM
    unblockChatJob = schedule.scheduleJob('0 6 * * *', () => {
        ctx.reply('khoá mõm' + timeNow)
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
