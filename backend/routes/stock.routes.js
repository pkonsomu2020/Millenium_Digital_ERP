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
  deletePurchaseHistory,
  getWaterDeliveries,
  addWaterDelivery,
  deleteWaterDelivery,
  updateWaterDelivery,
  getMonthlyCategoryPurchases,
  getCategoryComments,
  saveComment,
} from '../controllers/stock.controller.js';

const router = express.Router();

// Stock item routes
router.get('/', getAllStockItems);
router.get('/stats', getStockStats);
router.get('/low-stock', getLowStockItems);
router.get('/category/:category', getStockByCategory);
router.get('/category/:category/monthly', getMonthlyCategoryPurchases);
router.get('/:id', getStockItemById);
router.post('/', createStockItem);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

// Purchase history
router.post('/:id/purchase', addPurchaseHistory);
router.get('/:id/purchase-history', getPurchaseHistory);
router.put('/purchase/:purchaseId', updatePurchaseHistory);
router.delete('/purchase/:purchaseId', deletePurchaseHistory);

// Water deliveries
router.get('/water/deliveries', getWaterDeliveries);
router.post('/water/deliveries', addWaterDelivery);
router.put('/water/deliveries/:id', updateWaterDelivery);
router.delete('/water/deliveries/:id', deleteWaterDelivery);

// Comments
router.get('/comments/:category', getCategoryComments);
router.post('/comments', saveComment);

export default router;
