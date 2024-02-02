import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { registerValidation } from "./validations/auth.js"; // Валидация перед регистрации
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";
import * as PhotoController from './controllers/PhotoUploadController.js';
import { postCreateValidation } from "./validations/post.js";
import multer from "multer";
import sharp from "sharp";
import handleValidateError from "./utils/handleValidateError.js";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import uniqid from 'uniqid';
// import ('dotenv').config();

mongoose
  .connect(
    // process.env.MONGODB_URI
    "mongodb+srv://admin:wwwwww@cluster0.uxnwna5.mongodb.net/blog?retryWrites=true&w=majority"
    // 'mongodb://admin:wwwwww@host:127.0.0.1/test3?options...';
  )
  .then(() => console.log("Db ok"))
  .catch((err) => console.log("Db error", err));
const app = express();

//----------------------------------------------------------------
const uploadsDir = path.join('./uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
//------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Регистрация => авторизация => получения информации
app.post("/auth/register", registerValidation, UserController.register);
app.post("/auth/login", UserController.login);
app.get("/auth/me", checkAuth, UserController.getMe);

//Создания поста => получения => изменения => удаления
app.get("/posts", PostController.getAll);
app.get("/prostitues", PostController.getProstitues);
app.get("/masseuses", PostController.getMasseuses);
app.get("/posts/:id", PostController.getOne);
app.get("/myposts/:id", PostController.getMyPosts);
app.post("/favorites", PostController.getFavorites);


app.post("/posts", checkAuth, postCreateValidation, handleValidateError, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postCreateValidation, handleValidateError, PostController.update);
app.patch("/posts/disable/:id", PostController.postDisableStatus);
app.patch("/posts/turnon/:id", PostController.postTurnOnStatus);
app.patch("/posts/removeimage/:id/:index", PostController.removePhoto);
app.patch("/posts/selectedtomain/:id/:index", PostController.selectedToMain);

//Загрузка картинок

app.use('/upload', (req, res, next) => {
  const uploadPath = path.join('./uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  // Создаем новую уникальную папку для каждого запроса
  const uniqueFolderName = uniqid();
  const folderPath = path.join(uploadPath, uniqueFolderName);
  fs.mkdirSync(folderPath);

  // Сохраняем путь к созданной папке в объекте запроса
  req.folderPath = folderPath;

  // Пропускаем запрос дальше
  next();
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Используем сохраненный путь к папке из объекта запроса
    cb(null, req.folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uniqid()}${ext}`);
  },
});



//----------------------------------------------------------------
//загрузка массив картинок на сервер
const upload = multer({ storage });
app.post('/upload', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    // Используем сохраненный путь к папке из объекта запроса
    const folderPath = req.folderPath;

    const filenames = req.files.map(file => path.join(folderPath, file.filename));
    res.json({ images: filenames });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//----------------------------------------------------------------

//Загрузка фото для верификации
const uploadDir = './uploads/veryfyPhoto'
if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadsDir);
}
// Создаем хранилище для Multer
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, req.folderPath);
  },
  filename: (req, file, cb) => {
    console.log(file)
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Инициализируем объект Multer
const upload2 = multer({ storage2 });

// Роут для загрузки картинки
app.post('/uploadverifyphoto', upload2.single('image'), (req, res) => {
  try {
    console.log(req.file)
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const filePath = path.join(uploadDir,`${uniqid()}_${req.file.originalname}`,);
    res.json({ imagePath: filePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//----------------------------------------------------------------

app.listen(process.env.PORT || 4444, (err) => {
  if (err) return console.log(err);

  console.log("Server ok");
});

function pausa(ms = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  });
}