const { AUTH_SECRET } = require('./../../.env')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jwt-simple')
const User = require('./../models/User')
const mongoose = require('mongoose')

exports.create = async (req, res) => {

    const { name, email, password } = req.body

    try {

        if (!name.trim() || !email.trim() || !password.trim()) return res.status(400).send('Preencha corretamente todos os campos.')

        const userExists = await User.findOne({ email })

        if (userExists) return res.status(400).send('Email não permitido, tente outro.')

        const passwordCreated = bcrypt.hashSync(password, saltRounds);

        const user = {
            name,
            email,
            password: passwordCreated
        }
    
        await User.create(user)

        res.status(200).send('Cadastro realizado com sucesso.')
    } catch (error) {
        console.log('erro na criação do usuário')
        res.status(400).send('erro ao criar usuário.') 
    }
}

exports.find = async (req, res) => {
    
    const { email, password } = req.params

    try {

        if (!email.trim() || !password.trim()) return res.status(400).send('Preencha os campos corretamente.')

        let user = await User.findOne({ email })

        if (!user) return res.status(400).send('usuário não existe.')

        let passwordCompare = bcrypt.compareSync(password, user.password)

        if (!passwordCompare) return res.status(400).send('Dados informados não correspondem.') 

        user.password = password
        let payload = {
            ...user._doc,
            tokenCreatedAt: Date.now()
        }

        let token = jwt.encode(payload, AUTH_SECRET)

        let userResponse = {
            ...user._doc,
            token
        }

        res.status(200).json(userResponse)

    } catch (error) {
        return res.status(400).send('Erro ao buscar usuário.')
    }
}

exports.findAll = async (req, res) => {
    console.log('users all----')
    try {
        let users = await User.find({})
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json([])
    }
}

exports.update = async (req, res) => {

    const idUser = req.params.id
    const { name, email, password } = req.body

    const myUser = await User.findOne({ _id: mongoose.Types.ObjectId(idUser) })

    // verificar s usuário existe
    if (myUser) {

        // se email for o msm do meu atualizar só o nome
        if (email == myUser.email) {

            const passwordCreated = bcrypt.hashSync(password, saltRounds);

            await User.updateOne({ _id: mongoose.Types.ObjectId(idUser) }, {
                $set: {
                    name,
                    password: passwordCreated
                }
            })

            const newUser = await User.findOne({ _id: mongoose.Types.ObjectId(idUser) })

            return res.status(200).json({
                name: newUser.name,
                email: newUser.email,
                password
            }) 

        } else {

            const emailExists = await User.findOne({ email }, { email: 1 })

            // se email não existe entrar na condição
            if (!emailExists) {

                const passwordCreated = bcrypt.hashSync(password, saltRounds);

                await User.updateOne({ _id: mongoose.Types.ObjectId(idUser) }, {
                    $set: {
                        name,
                        email,
                        password: passwordCreated
                    }
                })
                
                const newUser = await User.findOne({ _id: mongoose.Types.ObjectId(idUser) })

                return res.status(200).json({
                    name: newUser.name,
                    email: newUser.email,
                    password
                }) 

            } else {
                return res.status(400).send('Escolha outro email')
            }
        }

    } else {
        return res.status(400).send('Usário não existe')
    }
    
}

exports.updateAvatar = async (req, res) => {

    try {
        User.updateOne({ _id: req.params.id }, {
            avatar: req.file.filename
        }).then( async response => {
            const newUser = await User.findOne({ _id: req.params.id }, { avatar: 1 })
            res.status(200).json(newUser)
        })
    } catch (error) {
        return res.status(400).send('Erro ao atualizar avatar.')
    }
}

exports.userOnOrOff = async (_id, status) => {
    try {
        await User.updateOne({ _id: mongoose.Types.ObjectId(_id) }, {
            $set: {
                online_at: status
            }
        })

        const userStatus = await User.findOne({ _id: mongoose.Types.ObjectId(_id) })
            
        return userStatus
    } catch (error) {
        return 'Erro ao atualizar status.'
    }
}
