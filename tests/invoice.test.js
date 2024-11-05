const request = require('supertest');
const { connectDb } = require('./../db/testdb');
const app = require('../app');

const Invoice = require('../models/Invoice');

describe('Invoice Endpoints', () => {
  beforeAll(connectDb);
});

afterEach(async () => {
  // Clean up the database after each test
  await Invoice.deleteMany({});
});

afterAll(async () => {
  // Disconnect from the database after all tests are complete
  await mongoose.connection.close();
});

// it('should create a new invoice', async () => {
//   const newInvoice = {
//     user: mongoose.Types.ObjectId().toString(),
//     items: [
//       { description: 'Item 1', quantity: 2, price: 50 },
//       { description: 'Item 2', quantity: 1, price: 30 },
//     ],
//     dueDate: new Date().toISOString(),
//   };

//   const response = await request(app).post('/api/v1/invoices').send(newInvoice);

//   expect(response.statusCode).toBe(201);
//   expect(response.body.success).toBe(true);
//   expect(response.body.data.totalAmount).toBe(130);
// });

it('should retrieve all invoices', async () => {
  // Create some test invoices
  await Invoice.create([
    {
      user: mongoose.Types.ObjectId(),
      items: [{ description: 'Test 1', quantity: 1, price: 100 }],
      totalAmount: 100,
      dueDate: new Date(),
    },
    {
      user: mongoose.Types.ObjectId(),
      items: [{ description: 'Test 2', quantity: 2, price: 50 }],
      totalAmount: 100,
      dueDate: new Date(),
    },
  ]);

  const response = await request(app).get('/api/v1/invoices');
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
