const request = require('supertest');
const { connectDb, closeDb } = require('./../db/testdb');
const app = require('../app');

const Transaction = require('../models/transactionModel');

describe('Transaction Endpoints', () => {
  beforeAll(() => {
    return connectDb;
  });
});

afterEach(async () => {
  // Clean up the database after each test
  await Transaction.deleteMany({});
});

afterAll(async () => {
  return closeDb;
});

it('should create a new invoice', async () => {
  const transaction = await Transaction.create({
    userId: mongoose.Types.ObjectId(),
    transactionType: 'deposit',
    amount: 60000,
  });

  const response = await request(app)
    .post('/api/v1/transactions/deposit')
    .send(transaction);

  expect(response.statusCode).toBe(201);
  expect(response.body.success).toBe('success');
  expect(response.body.message).toBe(String);
});

it('should retrieve all invoices', async () => {
  // Create some test invoices
  const transaction = await Transaction.create({
    userId: mongoose.Types.ObjectId(),
    transactionType: 'deposit',
    amount: 60000,
  });

  const response = await request(app)
    .get('/api/v1/transactions')
    .send(transaction);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.length).toBe(2);
});

it('should retrieve an invoice by ID', async () => {
  const invoice = await Invoice.create({
    user: mongoose.Types.ObjectId(),
    items: [{ description: 'Test Item', quantity: 1, price: 100 }],
    totalAmount: 100,
    dueDate: new Date(),
  });

  const response = await request(app).get(`/api/v1/invoices/${invoice._id}`);
  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.totalAmount).toBe(100);
});

it('should update an invoice', async () => {
  const invoice = await Invoice.create({
    user: mongoose.Types.ObjectId(),
    items: [{ description: 'Initial Item', quantity: 1, price: 100 }],
    totalAmount: 100,
    dueDate: new Date(),
  });

  const updatedData = {
    items: [{ description: 'Updated Item', quantity: 2, price: 100 }],
    totalAmount: 200,
  };

  const response = await request(app)
    .put(`/api/v1/invoices/${invoice._id}`)
    .send(updatedData);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.totalAmount).toBe(200);
  expect(response.body.data.items[0].description).toBe('Updated Item');
});

it('should delete an invoice', async () => {
  const invoice = await Invoice.create({
    user: mongoose.Types.ObjectId(),
    items: [{ description: 'Delete Item', quantity: 1, price: 100 }],
    totalAmount: 100,
    dueDate: new Date(),
  });

  const response = await request(app).delete(`/api/v1/invoices/${invoice._id}`);
  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);

  // Verify the invoice was deleted
  const deletedInvoice = await Invoice.findById(invoice._id);
  expect(deletedInvoice).toBeNull();
});
