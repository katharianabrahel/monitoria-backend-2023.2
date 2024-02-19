import { Router } from "express";
import multer from "multer";
import { prisma } from "../prisma.js";
import * as uuid from 'uuid';
import path from "path";
import fs from "fs";

export const postRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

postRouter.post("/", upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Please upload an image.");
  }

  const { title, content } = req.body;

  const newPost = await prisma.post.create({
    data: {
      id: uuid.v4(),
      title: title,
      content: content,
      imageUrl: req.file.path
    },
  });

  res.send(newPost);
});

postRouter.get("/", async (req, res) => {
  const posts = await prisma.post.findMany();
  res.send(posts);
});

postRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  if (post) {
    res.sendFile(path.resolve(post.imageUrl));
  } else {
    res.status(404).send("Post not found.");
  }
});
