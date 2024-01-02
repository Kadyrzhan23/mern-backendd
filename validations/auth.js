import { body } from "express-validator";

export const registerValidation = [
    body('fullName', 'Укажите имя').isLength({ min: 3 }),
    body('phoneNumber', 'Неверный формат номера телефона').isString({ min: 7 }),
    body('password','Пароль должен быть минимум 5 символов' ).isLength({ min: 5 }),
]