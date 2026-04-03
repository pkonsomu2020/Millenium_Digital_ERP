import express from 'express';
import multer from 'multer';
import {
  getAllDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  replaceDocument,
  getAllMinutes,
  uploadMinutes,
  deleteMinutes,
  updateMinutes,
  replaceMinutes
} from '../controllers/document.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Document Vault routes
router.get('/documents', getAllDocuments);
router.post('/documents', upload.single('file'), uploadDocument);
router.put('/documents/:id', updateDocument);
router.put('/documents/:id/replace', upload.single('file'), replaceDocument);
router.delete('/documents/:id', deleteDocument);

// Meeting Minutes routes
router.get('/minutes', getAllMinutes);
router.post('/minutes', upload.single('file'), uploadMinutes);
router.put('/minutes/:id', updateMinutes);
router.put('/minutes/:id/replace', upload.single('file'), replaceMinutes);
router.delete('/minutes/:id', deleteMinutes);

export default router;
