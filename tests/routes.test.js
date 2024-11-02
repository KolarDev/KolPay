test('addition confirm', () => {
  let a = 5;
  let b = 3;
  expect(a + b).toBe(8);
  expect(a - b).not.toBe(9);
});
