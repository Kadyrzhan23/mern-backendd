import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validationResult } from "express-validator";
import UserModel from '../models/Users.js'

export const register = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array())
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            fullName: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            passwordHash: hash,
        })

        const user = await doc.save()

        const token = jwt.sign({
            _id: user._id,
        },
            "secret123",
            {
                expiresIn: '30d'
            }
        )

        const { passwordHash, ...userData } = user._doc

        res.status(200).json({
            ...userData,
            token
        })
    } catch (err) {
        res.json({
            message: 'Пользователь с таким номером уже зарегистрирован'
        })
    }
}

export const login =  async (req, res) => {
    try {
        const user = await UserModel.findOne({ phoneNumber: req.body.phoneNumber })
        console.log(req.body)
        if (!user) {
            return res.status(404).json({
                message: 'Неверный логин или пароль 222'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль 111'
            })
        }

        const token = jwt.sign({
            _id: user._id,
        },
            "secret123",
            {
                expiresIn: '30d'
            }
        )

        const { passwordHash, ...userData } = user._doc

        res.status(200).json({
            ...userData,
            token
        })
    } catch (err) {
        res.json({
            message: 'Не удалось авторизоватся'
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)

        if(!user){
            return res.status(404).json({
                message:"Пользователь не найден"
            })
        }

        const { passwordHash, ...userData } = user._doc

        res.json({
            ...userData,
        })
    } catch (err) {
        res.status(404).json({
            message:"Нет доступа"
        })
    }
}

