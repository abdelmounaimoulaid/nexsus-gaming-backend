import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middlewares/auth.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', requireAuth, upload.single('image'), UploadController.uploadImage);

export default router;
