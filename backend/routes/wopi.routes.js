import express from 'express';
import {
  checkFileInfo,
  getFileContents,
  putFileContents,
  getTextContent,
  saveTextContent,
} from '../controllers/wopi.controller.js';

const router = express.Router();

// WOPI protocol endpoints (used by Office Online)
router.get('/files/:id',          checkFileInfo);
router.get('/files/:id/contents', getFileContents);
router.post('/files/:id/contents', putFileContents);

// Native text/csv editor endpoints
router.get('/text/:id',  getTextContent);
router.post('/text/:id', saveTextContent);

export default router;
