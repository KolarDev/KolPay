const Brevo = require('@getbrevo/brevo');
const apiInstance = new Brevo.TransactionalSMSApi();

// Set up the API key for authentication
const apiKey = Brevo.ApiClient.instance.authentications['api-key'];
apiKey.apiKey = proccess.env.SMS_API_KEY;

// Define the SMS sending function
async function sendSMSAlert(recipientPhone, message) {
    const smsData = {
        sender: 'KolPay',  // Custom sender name (must be set up in Brevo)
        recipient: recipientPhone,  // Phone number with country code
        content: message,  // SMS content
        type: 'transactional',  // Type can be 'transactional' or 'marketing'
    };

    try {
        const response = await apiInstance.sendTransacSms(smsData);
        console.log('SMS sent successfully:', response);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}


///////////////////////
const axios = require('axios');

// Brevo API key
const apiKey = 'YOUR_BREVO_API_KEY';

// Function to send SMS
async function sendTransactionalSMS(recipientPhone, messageContent) {
    const url = 'https://api.brevo.com/v3/transactionalSMS/sms';
    
    const headers = {
        'api-key': apiKey,
        'Content-Type': 'application/json',
    };

    const data = {
        sender: 'YourAppName',  // Replace with your sender name
        recipient: recipientPhone,  // International format phone number
        content: messageContent,  // SMS content
        type: 'transactional',  // Type of SMS
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
}

// Example usage:
sendTransactionalSMS('+1234567890', 'Your transaction was successful. Thank you!');
