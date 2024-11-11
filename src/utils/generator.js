const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Generate unique transfer reference for inter-bank transfers
const generateTransferReference = () => {
  return `KolPay_${uuidv4()}`;
};

// Generate a unique account number for user
const genAccNo = async (user, phone) => {
  const lastUser = await user.countDocuments();

  const serialNumber = (lastUser + 1).toString().padStart(5, '0');

  const phoneNumber = phone.slice(1, 5);

  return `${serialNumber}${phoneNumber}`;
};

// Generate OTP code for verifications
const generateOtp = () => {
  Math.floor(100000 + Math.random() * 900000).toString();
};

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument();

  const filePath = `./invoices/${invoice.invoiceNumber}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Invoice', { align: center });
  doc.text();
  doc.text();
  doc.text();
  doc.text();
  doc.end();

  return filePath;
};

module.exports = {
  genAccNo,
  generateOtp,
  generateInvoicePDF,
  generateTransferReference,
};
