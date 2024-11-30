const User = require('./../src/models/userModel');
const httpMocks = require('node-mocks-http');
const { mockUser } = require('./mocks/mockUser');
const AppError = require('./../src/utils/appError');
const {
  userProfile,
  upload,
  updateProfile,
  deleteUser,
  getMyBalance,
  getAllUsers,
} = require('./../src/controllers/userController');

jest.mock('./../src/models/userModel');

describe('User Controller', () => {
  // User Profile route
  describe('Get user profile', () => {
    // 1.
    it('should get user profile and return 200', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      User.findById.mockResolvedValue(mockUser);
      await userProfile(req, res);
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: {
          username: 'john123',
          fullname: 'john doe',
          email: 'johndoe@example.com',
          phone: 90616304210,
          accountNumber: 90616304210,
          nationality: 'Nigerian',
          dob: '2024-11-28',
          address: 'No 12 john street lagos lanigeria',
        },
      });
    });
    // 1b.
    it('should return error 404 if user is not found', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      User.findById.mockResolvedValue(null);
      await userProfile(req, res, next);
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(next).toHaveBeenCalledWith(new AppError('User not found', 404));
    });
    // 1c.
    it('should return error 500 if there is server error', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      User.findById.mockResolvedValue(null);
      await userProfile(req, res, next);
      expect(res).toHaveBeenCalledWith({
        status: 'Failed!',
        message: 'Error fetching user data !',
      });
    });
  });

  // 2
  describe('Get user balance', () => {
    it('should return users account balance with 200 status code', async () => {});
  });
});
