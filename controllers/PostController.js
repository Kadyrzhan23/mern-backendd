import { ObjectId } from "mongodb"
import fs from 'fs'
import { unlinkSync } from 'node:fs';
import PostModel from "../models/Post.js"


export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            aboutMe: req.body.aboutMe,//--//
            category: req.body.category,//--//
            languages: req.body.languages,//--//
            location: req.body.location,//--//
            name: req.body.name,//--//
            phoneNumber: req.body.phoneNumber,//--//
            main: req.body.main,//--//
            params: req.body.params,//--//
            price: req.body.price,//--//
            massaj: req.body.massaj,//--//
            special: req.body.special,//--
            user:req.userId,
            socials:req.body.socials,
            postStatus:{
                permissions:true,
                status:true,
                tarif:'start'
            },
            images:req.body.images,
            imageVerify:req.body.imageVerify
        })
        const post = await doc.save()
        res.json(post)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().exec()
        const response = await posts.reverse()
        res.json(response)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id
        const doc = await PostModel.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } }).populate()
        if (!doc) {
            return res.status(404).json({
                message: 'Не удалось найти статью',
                err: e,
            })
        }
        const data = await PostModel.findOne({ _id: postId }).populate('user').exec()
        if (!data) {
            return res.status(404).json({
                message: 'Не удалось найти статью',
                err: e,
            })
        }
        res.json(data)
    } catch (e) {
        console.log(e)
        res.status(404).json({
            message: 'Не удалось найти статью',
            err: e,
        })
    }

}

export const remove = async (req, res) => {
    try {
        const postId = req.params.postId
        await PostModel.findOneAndDelete(postId)
        .then(post => {
            res.status(200).json(post)
        }) 
            
    } catch (e) {
        return res.status(500).json({
            message: 'Не удалось удалить статью',
            err: err
        });
    }
}

export const update = async (req,res)=> {
    try{
        const postId = req.params.id
        await PostModel.updateOne({_id:postId},{
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            services: req.body.services,
            params:req.body.params,
            adress:req.body.adress,
            aboutMe: req.body.aboutMe,
            user:req.userId
        })

        res.json({
            success:true
        })
    }catch(e){
        return res.status(404).json({
            message:'Произошло ошибка'
        });
    }

}

export const getProstitues = async (req, res) => {
    try {
        const posts = await PostModel.find({category:'проститутка'})

        res.status(200).json(
            posts
        )
        
    } catch (error) {
        res.status(500).json({
            message:'Не удалось получить список'
        })
    }
}

export const getMasseuses = async (req, res) => {
    try {
        const posts = await PostModel.find({category:'массажистка'})

        res.status(200).json(
            posts
        )
        
    } catch (error) {
        res.status(500).json({
            message:'Не удалось получить список'
        })
    }
}


export const getMyPosts = async (req, res) => {
    try {
        const userId = req.params.id
        const myPosts = await PostModel.find({user:userId})
        res.json(myPosts)
    } catch (err) {
        res.json({message:err.message})
    } 
}


export const getFavorites = async (req, res) => {
    try {
        const params = req.body.params
        let temp = [];
        params.map((key) => {
            temp.push({_id:(key)})
        })
        const posts = await PostModel.find({ $or: temp})
        res.json(posts) 
    } catch (error) {
        res.json({message:error.message})
    }
}

export const postTurnOnStatus = async (req, res) => {
    try {
        const postId = req.params.id
        const post = await PostModel.findById(postId)
        await PostModel.updateOne({_id:postId},{
            postStatus:{
                permissions: true,
                status:post.postStatus.status,
                tarif:post.postStatus.tarif
            }
        });
        const response = await PostModel.findById(postId)
        res.json(response)
    } catch (error) {
        console.log(error.message)
    }
}

export const postDisableStatus = async (req, res) => {
    try {
        const postId = req.params.id
        const post = await PostModel.findById(postId)
        await PostModel.updateOne({_id:postId},{
            postStatus:{
                permissions: false,
                status:post.postStatus.status,
                tarif:post.postStatus.tarif
            }
        });
        const response = await PostModel.findById(postId)
        res.json(response)
    } catch (error) {
        console.log(
            error.message
        )
    }
}

export const removePhoto = async (req, res) => {
    try {
        const id = req.params.id
        const index = req.params.index
        const post = await PostModel.findById(id)
        const path = post.images[index]
        fs.unlink(path,(err)=> {
            if(err){
                console.log(err)
            }
        })
        res.json({success: true})
    } catch (error) {
        console.log(error.message)
    }
}


export const selectedToMain = async (req, res)=> {
    try {
        const id = req.params.id
        const index = req.params.index
        const post = await PostModel.findById(id)
        let images = post.images
        const current = images[index]
        images.splice(index, 1)
        images.unshift(current)
        await PostModel.updateOne({_id:id},{
            images:images
        });
        res.json({success: true})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
