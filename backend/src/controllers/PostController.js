const Post = require('./../models/Post')
const mongoose = require('mongoose')

exports.create = async (req, res) => {

    let post = {
        user: mongoose.Types.ObjectId(req.params.user),
        description: req.body.description,
        media: {
            type: req.file.mimetype,
            url: req.file.filename
        },
        createdAt: new Date()
    }

    try {
        await Post.create(post)
        res.status(200).send('post criado com sucesso.')
    } catch(error) {
        res.status(400).send('Erro ao criar post.')
    }
    
}

exports.findAll = async (req, res) => {

    try {
        let posts = await Post.find({}).sort({createdAt: -1})
            .populate({ path: 'user' })
            
        res.status(200).json(posts)
    } catch(error) {
        res.status(400).send('Erro ao buscar posts.')
    }
    
}

exports.remove = async (req, res) => {

    try {
        console.log('remove post')
        await Post.deleteOne({ _id: req.params.id })
        res.status(200).json({})
    } catch(error) {
        res.status(400).send('Erro ao remover post.')
    }
}
