const mongoose = require("mongoose")
const authDB = {
    name: 'Cristhofer',
    pass: 'cm1996'
}

const config = [
    // `mongodb://${authDB.name}:${authDB.pass}@ds031591.mlab.com:31591/jogo-da-velha`,
    `mongodb://127.0.0.1:27017/my-friends`,
    {
        useCreateIndex: true,
        useNewUrlParser: true
    }
]


mongoose.connect(...config)
    .then(db => {
        console.log('Banco conectado....')
    })
    .catch(err => {
        console.log('Erro ao conectar banco....')
    })