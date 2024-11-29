const generateMockUser = (overrides = {}) => ({
  _id: '123',
  fullname: 'Default Name',
  email: 'default@example.com',
  accountNumber: 1234567890,
  address: 'Default Address',
  dob: '2000-01-01',
  nationality: 'Default Country',
  phone: 1234567890,
  username: 'defaultuser',
  ...overrides,
});

// Mock user data
const mockUser = generateMockUser({
  fullname: 'john doe',
  email: 'johndoe@example.com',
  accountNumber: 90616304210,
  address: 'No 12 john street lagos lanigeria',
  dob: '2024-11-28',
  nationality: 'Nigerian',
  phone: 90616304210,
  username: 'john123',
});

module.exports = { mockUser };
