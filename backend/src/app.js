const PORT = 3003
const express = require('express')
const app = express()
const consign = require("consign")
const bodyParser = require('body-parser')
const cors = require('cors')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const startSocket = require('./helpers/socket').start(io)
const logger = require('morgan')
require('./config/database')

app.gSocket = io

app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname+'/uploads'));
app.use('/assets', express.static(__dirname+'/uploads_messages'));

app.get('/files', (req, res, next) => {
    res.sendFile(`${__dirname}/uploads/${req.query.file}`)
})

app.get('/files/messages', (req, res, next) => {
    res.sendFile(`${__dirname}/uploads_messages/${req.query.file}`)
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({
    origin: '*'
}))
app.use(logger('dev'));

// carregar rotas
consign({
    cwd: __dirname + '/',
    locale: 'pt-br',
    logger: console,
    verbose: true,
    extensions: [ '.js', '.json', '.node' ],
    loggingType: 'info'
})
  .include('routes')
  .into(app);


server.listen(PORT, () => {
    console.log(`Running..... \nPORT: ${PORT}`)
})
