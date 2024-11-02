const express = require('express');
const { protectRoute, adminAuth } = require('./../middlewares/authorize');
const {
    getAllInvoices,
    createInvoice,
    getMyInvoices,
    getInvoice,
    deleteInvoice,
} = require('./../controllers/invoiceController');

const router = express.Router();

// protect route for only loggedIn users
router.use(protectRoute);

// Routes to manage an Invoice
router.post('/new-invoice', createInvoice);
router.get('/my-invoices', getMyInvoices);


// Restrict below routes to only admins
router.use(adminAuth('admin', 'Super-admin'));

// Admin routes to manage Invoices
router.get('/invoices', getAllInvoices);
router.get('/:id/invoices', getInvoice);
router.delete('/invoices', deleteInvoice);

module.exports = router;
