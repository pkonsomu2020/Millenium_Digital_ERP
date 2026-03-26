import express from 'express';
import {
  getAllStockItems,
  getStockItemById,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  getLowStockItems,
  getStockByCategory,
  addPurchaseHistory,
  getStockStats,
  getPurchaseHistory,
  updatePurchaseHistory,
  deletePurchaseHistory
} from '../controllers/stock.controller.js';

const router = express.Router();

// Stock item routes
router.get('/', getAllStockItems);
router.get('/stats', getStockStats);
router.get('/low-stock', getLowStockItems);
router.get('/category/:category', getStockByCategory);
router.get('/:id', getStockItemById);
router.post('/', createStockItem);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

// Purchase history
router.post('/:id/purchase', addPurchaseHistory);
router.get('/:id/purchase-history', getPurchaseHistory);
router.put('/purchase/:purchaseId', updatePurchaseHistory);
router.delete('/purchase/:purchaseId', deletePurchaseHistory);

export default router;
