import sharp from "sharp";
import multer from "multer";
import path from "path";
import fs from "fs";


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

export const save = () => async (req, res, next) => {
    try {
        console.log('work')
        const uploadedFiles = req.files;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ error: "No images uploaded." });
        }

        const uploadedFileNames = uploadedFiles.map((file) => file.filename);
        const uploadedFilePaths = uploadedFileNames.map((filename) =>
            path.join("uploads", filename)
        );

        res.json({ images: uploadedFilePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const resizePhoto = async (req, res, next) => { };

export const cleanUploads = async () => { };
