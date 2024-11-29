const User = require('./../src/models/userModel');
const httpMocks = require('node-mocks-http');
const { mockUser } = require('./mocks/mockUser');
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
      // 2.
    });
  });
});
