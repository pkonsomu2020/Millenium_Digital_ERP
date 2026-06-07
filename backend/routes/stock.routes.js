import express from 'express';
import {
  getAllStockItems,
  getStockItemById,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  getStockByCategory,
  getStockStats,
  getStockMonths,
  createStockMonth,
  addStockMonthTemplate,
  getCategoryEntries,
  upsertStockEntry,
  batchUpsertEntries,
  getWaterDeliveries,
  addWaterDelivery,
  deleteWaterDelivery,
  updateWaterDelivery,
  getCategoryComments,
  saveComment,
} from '../controllers/stock.controller.js';

const router = express.Router();

// Stock item routes
router.get('/', getAllStockItems);
router.get('/stats', getStockStats);
router.get('/category/:category', getStockByCategory);
router.get('/category/:category/months', getStockMonths);
router.get('/category/:category/entries', getCategoryEntries);
router.get('/:id', getStockItemById);
router.post('/', createStockItem);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

// Stock months
router.post('/months', createStockMonth);
router.post('/months/template', addStockMonthTemplate);

// Stock entries (dual-period data)
router.post('/entries', upsertStockEntry);
router.post('/entries/batch', batchUpsertEntries);

// Water deliveries
router.get('/water/deliveries', getWaterDeliveries);
router.post('/water/deliveries', addWaterDelivery);
router.put('/water/deliveries/:id', updateWaterDelivery);
router.delete('/water/deliveries/:id', deleteWaterDelivery);

// Comments
router.get('/comments/:category', getCategoryComments);
router.post('/comments', saveComment);

export default router;
