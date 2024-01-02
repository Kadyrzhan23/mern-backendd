import { body } from 'express-validator'

export const postCreateValidation = [
    body('name','Введите имя').isLength({min:3}).isString(),
    body('phoneNumber','Введите номер телефона').isLength({min:3}).isString(),
    body('main','Укажите услуги(укажите масссив)').isObject(),
    body('params','Укажите ваши параметры').isObject(),
    body('price','Укажите цену').isObject(),
    body('aboutMe','Напишите о себе').isString(),
    body('category','Выберите категорию').isString(),
    body('languages','Знания языков').isObject(),
    body('location','Место встречи').isObject(),
    body('massaj','Массаж').isObject(),
    body('special','Срециальные предложении').isObject(),
    body('images','Фото в виде массив').isArray(),
    body('imageVerify','Фото для проверки').optional().isString(),
    body('socials','Socials object').optional().isObject(),
]