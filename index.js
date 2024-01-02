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
    // process.env.MONGO_DB
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

const uploadsResizePhoto = path.join('./uploadsMin');
if (!fs.existsSync(uploadsResizePhoto)) {
  fs.mkdirSync(uploadsResizePhoto);
}

const uploadsResizePhotover = path.join('./uploadsMin/verification');
if (!fs.existsSync(uploadsResizePhotover)) {
  fs.mkdirSync(uploadsResizePhotover);
}



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads');
//   },
//   filename: function (req, file, cb) {
//     // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     cb(null, `${uniqid()}/${ Date.now() + path.extname(file.originalname)}`);
//   }
// });
// const upload = multer({ storage: storage });

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
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidateError,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidateError,
  PostController.update
);

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





const upload = multer({ storage });
app.post('/upload', upload.array('images', 10), async (req, res) => {
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


// app.post('/upload', upload.array('images', 10), async (req, res) => {
//   try {
//     // console.log(req.files)
//     const files = []
//     const uploadedFiles = req.files;

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       return res.status(400).json({ error: "No images uploaded." });
//     }

//     const uploadedFileNames = uploadedFiles.map((file) => file.filename);
//     const uploadedFilePaths = uploadedFileNames.map((filename) =>
//       path.join('uploads', filename)
//     );

    // const dir = `uploadsMin/${Date.now()}`
    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir);
    // }
    // uploadedFilePaths.map(async (file) => {
    //   const fileName = `./${dir}/${uniqid()}.webp`
    //   sharp(file)
    //     // .resize(354, 472)
    //     .resize()
    //     .toFile(fileName, async (err, info) => {
    //       if (err) {
    //         // throw new Error
    //         console.log(err)
    //       } else {
    //         await pausa()
    //         files.push(fileName)
    //       }
    //     });
    // })
    // try {
    //   // Получаем список файлов и подпапок внутри uploads
    //   const dir = fs.readdirSync('./uploads')


    //   // Удаляем каждый файл и подпапку
    //   dir.map((file, index) => {
    //     if (index !== 0) {
    //       fs.unlink(`./uploads/${file}`, (err) => {
    //         if (err) throw err
    //       })
    //     }
    //   })

    // } catch (error) {
    //   console.error('Error clearing uploads folder:', error);
    // }
    // await pausa(5000)
//     res.json({ images: uploadedFilePaths });

//   } catch (error) {
//     console.error("Error uploading images:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post('/upload', upload.array('images', 10), async (req, res) => {
//   try {
//     // console.log(req.files)
//     const files = []
//     const uploadedFiles = req.files;

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       return res.status(400).json({ error: "No images uploaded." });
//     }

//     const uploadedFileNames = uploadedFiles.map((file) => file.filename);
//     const uploadedFilePaths = uploadedFileNames.map((filename) =>
//       path.join('uploads', filename)
//     );

//     const dir = `uploadsMin/${Date.now()}`
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     uploadedFilePaths.map(async (file) => {
//       const fileName = `./${dir}/${uniqid()}.webp`
//       sharp(file)
//         // .resize(354, 472)
//         .resize()
//         .toFile(fileName, async (err, info) => {
//           if (err) {
//             // throw new Error
//             console.log(err)
//           } else {
//             await pausa()
//             files.push(fileName)
//           }
//         });
//     })
//     try {
//       // Получаем список файлов и подпапок внутри uploads
//       const dir = fs.readdirSync('./uploads')


//       // Удаляем каждый файл и подпапку
//       dir.map((file, index) => {
//         if (index !== 0) {
//           fs.unlink(`./uploads/${file}`, (err) => {
//             if (err) throw err
//           })
//         }
//       })

//     } catch (error) {
//       console.error('Error clearing uploads folder:', error);
//     }
//     await pausa(5000)
//     res.json({ images: files });

//   } catch (error) {
//     console.error("Error uploading images:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



app.use('/uploadVerificationPhoto', (req, res, next) => {
  const uploadPath = path.join('./verifyPhoto');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  // Пропускаем запрос дальше
  next();
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('./verifyPhoto'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${ext}`;
    cb(null, filename);
  },
});

const upload2 = multer({ storage2 });

app.post('/uploadVerificationPhoto', upload2.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const filePath = path.join('./verifyPhoto', req.file.filename);
    res.json({ imagePath: filePath });
  } catch (error) {
    console.error('Error uploading verification photo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// app.post('/uploadVerificationPhoto', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
//     await pausa(2000)

//     //Изменения размера картинки

//     const dir = `uploads/verification`
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     const fileName = `./${dir}/${uniqid()}.webp`
//     sharp(`./uploads/${req.file.filename}`)
//       .resize()
//       .toFile(fileName, async (err, info) => {
//         if (err) {
//           console.log(err)
//           // throw new Error
//         } else {
//           console.log(info)
//         }
//       })

//   //     .rotate(true)
//   //     .resize(200)
//   //     .jpeg({ mozjpeg: true })
//   //     .toBuffer()
//   //     .then(data => { 
//   //       console.log(data)
//   //     })
//   // .catch(err => {
//   //   if(err) {
//   //     console.log(err)
//   //   }
//   // });
// await pausa(5000)

// res.status(200).json({ imagePath: fileName, message: 'File uploaded successfully.' });
//   } catch (error) {
//   console.error('Error uploading file:', error);
//   res.status(500).send('Internal Server Error');
// }
// });







app.listen(process.env.PORT || 4444, (err) => {
  if (err) return console.log(err);

  console.log("Server ok");
});

function pausa(ms = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  });
}