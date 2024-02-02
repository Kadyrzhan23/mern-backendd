import sharp from "sharp";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join('./../verifyPhoto', 'uploads');

// Создаем хранилище для Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    },
});


export const uploadVerifyPhoto = () => async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const filePath = path.join(uploadDir, req.file.filename);
        res.json({ imagePath: filePath });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const cleanUploads = async () => { };
