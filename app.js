import express from 'express'
const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json)

app.get('*', function (req, res) {
    res.send('Hello World')
})

app.listen(PORT, (err) => {
    if (err) console.log(err)
    console.log('Server listenning on PORT', PORT)
})
