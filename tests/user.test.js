const User = require('./../src/models/userModel');
const userController = require('./../src/controllers/userController');
const httpMocks = require('node-mocks-http');

jest.mock('./../src/models/userModel');

describe('User Controller', () => {
  describe('create user', () => {
    it('should create a new user', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {},
      });
    });
  });
});

const userController = require('../controllers/userController');
const User = require('../models/user'); // Mongoose model
const httpMocks = require('node-mocks-http'); // To mock req, res objects

jest.mock('../models/user'); // Mock Mongoose User model

describe('User Controller', () => {
  describe('createUser', () => {
    it('should create a new user and return status 201', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'John Doe', email: 'john@example.com' },
      });
      const res = httpMocks.createResponse();
      User.create.mockResolvedValue({
        name: 'John Doe',
        email: 'john@example.com',
      });

      await userController.createUser(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: { name: 'John Doe', email: 'john@example.com' },
      });
    });

    it('should handle errors and return status 400', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { email: 'invalid-email' },
      });
      const res = httpMocks.createResponse();
      User.create.mockRejectedValue(new Error('Invalid email'));

      await userController.createUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        status: 'fail',
        message: 'Invalid email',
      });
    });
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();
      User.findById.mockResolvedValue({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      });

      await userController.getUser(req, res);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: { id: '123', name: 'John Doe', email: 'john@example.com' },
      });
    });

    it('should return 404 if user is not found', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();
      User.findById.mockResolvedValue(null);

      await userController.getUser(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        status: 'fail',
        message: 'User not found',
      });
    });

    it('should handle errors and return status 500', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: { id: '123' },
      });
      const res = httpMocks.createResponse();
      User.findById.mockRejectedValue(new Error('Database error'));

      await userController.getUser(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        status: 'error',
        message: 'Database error',
      });
    });
  });

  // Add tests for updateUser and deleteUser similarly...
});
