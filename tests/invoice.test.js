// invoiceController.test.js

const request = require('supertest');
const app = require('../app'); // Assuming `app.js` is the entry point of your Express app
const {
  generateInvoice,
  createInvoice,
  getMyInvoices,
  getInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const Invoice = require('../models/invoiceModel');
const Transaction = require('../models/transactionModel');
const AppError = require('../utils/appError');

// Mock the models and any other utilities
jest.mock('../models/transactionModel');
jest.mock('../models/invoiceModel');
jest.mock('../utils/notificator');

describe('Invoice Controller', () => {
  describe('createInvoice', () => {
    it('should create an invoice for a user with transactions within date range', async () => {
      const userId = 'userId123';
      const req = {
        user: { id: userId },
        body: { startDate: '2023-01-01', endDate: '2023-01-31' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Mock Transaction and Invoice behavior
      Transaction.find.mockResolvedValue([{ amount: 50 }, { amount: 100 }]);
      Invoice.prototype.save = jest.fn().mockResolvedValue();

      await createInvoice(req, res, next);

      expect(Transaction.find).toHaveBeenCalledWith({
        user: userId,
        date: { $gte: req.body.startDate, $lte: req.body.endDate },
      });
      expect(Invoice.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { invoice: expect.any(Object) },
      });
    });

    it('should return error if no transactions found for the period', async () => {
      const req = {
        user: { id: 'userId123' },
        body: { startDate: '2023-01-01', endDate: '2023-01-31' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Transaction.find.mockResolvedValue([]);

      await createInvoice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed !',
        message: 'Error proccessing invoice !',
        error: expect.anything(),
      });
    });
  });

  describe('getMyInvoices', () => {
    it('should return all invoices for the user', async () => {
      const req = { user: { _id: 'userId123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Invoice.find.mockResolvedValue([
        { _id: 'invoiceId1' },
        { _id: 'invoiceId2' },
      ]);

      await getMyInvoices(req, res, next);

      expect(Invoice.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { invoices: expect.any(Array) },
      });
    });
  });

  describe('getInvoice', () => {
    it('should return an invoice by ID', async () => {
      const req = { params: { id: 'invoiceId123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Invoice.findById.mockResolvedValue({ _id: req.params.id });

      await getInvoice(req, res, next);

      expect(Invoice.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { invoice: expect.any(Object) },
      });
    });

    it('should return 404 if invoice not found', async () => {
      const req = { params: { id: 'invoiceId123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Invoice.findById.mockResolvedValue(null);

      await getInvoice(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError('No invoice found for that Id!', 404),
      );
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice by ID', async () => {
      const req = { params: { id: 'invoiceId123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Invoice.findByIdAndDelete.mockResolvedValue({ _id: req.params.id });

      await deleteInvoice(req, res, next);

      expect(Invoice.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Invoice deleted!',
        data: null,
      });
    });

    it('should return 404 if invoice not found', async () => {
      const req = { params: { id: 'invoiceId123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Invoice.findByIdAndDelete.mockResolvedValue(null);

      await deleteInvoice(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError('No invoice found for that Id!', 404),
      );
    });
  });
});
