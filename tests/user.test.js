const User = require('./../src/models/userModel');
const httpMocks = require('node-mocks-http');
const { mockUser } = require('./mocks/mockUser');
const AppError = require('./../src/utils/appError');
const {
  userProfile,
  updateProfile,
  deleteUser,
  getMyBalance,
  getAllUsers,
} = require('./../src/controllers/userController');

jest.mock('./../src/models/userModel');

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
    it('should return error 500 if there is server error', async () => {});
  });

  // 2
  describe('Get user balance', () => {
    it('should return users account balance with 200 status code', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      User.findById.mockResolvedValue({ balance: 1000 });
      await getMyBalance(req, res);
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: {
          balance: 256000,
        },
      });
    });
    // 2b
    it('should return error 404 if user is not found', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      User.findById.mockResolvedValue(null);
      await getMyBalance(req, res, next);
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(next).toHaveBeenCalledWith(new AppError('User not found', 404));
    });
    // 2c
    it('should return error 500 if there is server error', async () => {});
  });
  // 3
  describe('updateProfile', () => {
    it('should update user profile and return updated user data', async () => {
      const req = httpMocks.createRequest({
        method: 'PATCH',
        user: { id: '123' },
        body: { fullname: 'John Updated' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      User.findByIdAndUpdate.mockResolvedValue({
        _id: '123',
        fullname: 'John Updated',
      });

      await updateProfile(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { fullname: 'John Updated' },
        { new: true, runValidators: true },
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: { user: { _id: '123', fullname: 'John Updated' } },
      });
    });
    // 3b
    it('should return error if password update is attempted', async () => {
      const req = httpMocks.createRequest({
        method: 'PATCH',
        user: { id: '123' },
        body: { password: 'newpassword123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError('This route is not for password update!', 400),
      );
    });
  });
  // 4
  describe('deleteUser', () => {
    it('should delete user and return success response', async () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      User.findById.mockResolvedValue({
        _id: '123',
        fullname: 'John Doe',
      });

      await deleteUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        status: 'success',
        data: null,
      });
    });

    it('should return 404 if user is not found', async () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        user: { id: '123' },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      User.findById.mockResolvedValue(null);

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new AppError('User not found', 404));
    });
  });
  // Testing for all catch blocks
  describe('userProfile Catch Block', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: { id: '123' } }; // Mocked request object
      res = mockResponse(); // Mocked response object
      next = jest.fn(); // Mocked next function
    });

    testCatchBlock(
      userProfile,
      User.findById,
      new Error('Database error'),
      {
        status: 'Failed!',
        message: 'Error fetching user data !',
      },
      req,
      res,
      next,
    );
    testCatchBlock(
      getMyBalance,
      User.findById,
      new Error('Database error'),
      {
        status: 'Failed!',
        message: 'Error fetching user balance !',
      },
      req,
      res,
      next,
    );
  });
});

// Generic function for all catch blocks returninig server error 500 response status
const testCatchBlock = (
  controllerFunction,
  methodToMock,
  mockError,
  expectedResponse,
  req = {},
  res = {},
  next = jest.fn(),
) => {
  it('should handle errors and return the correct response', async () => {
    methodToMock.mockRejectedValue(mockError);

    // Mock res methods
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await controllerFunction(req, res, next);

    // Check that the correct response was sent
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });
};
// mock response function
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
