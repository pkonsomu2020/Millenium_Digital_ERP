import express from 'express';
import multer from 'multer';
import {
  getAllDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  getAllMinutes,
  uploadMinutes,
  deleteMinutes,
  updateMinutes
} from '../controllers/document.controller.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document Vault routes
router.get('/documents', getAllDocuments);
router.post('/documents', upload.single('file'), uploadDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);

// Meeting Minutes routes
router.get('/minutes', getAllMinutes);
router.post('/minutes', upload.single('file'), uploadMinutes);
router.put('/minutes/:id', updateMinutes);
router.delete('/minutes/:id', deleteMinutes);

export default router;
