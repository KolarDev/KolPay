const nodemailer = require("nodemailer");
const brevo = require('@getbrevo/brevo');

const pug = require("pug");
const htmlToText = require("html-to-text");


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.url = url;
        this.from = `KolPay <${process.env.EMAIL_FROM}>`;
        this.userName = user.fullname.split(" ")[1];
    }

    newTransport() {
        // if (process.env.NODE_ENV === 'production') {
            // Use Brevo for production
            let defaultClient = brevo.ApiClient.instance;
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.BREVO_API_KEY; // Set your Brevo API key

            return new brevo.TransactionalEmailsApi();
        // }  

        // // You can keep Nodemailer for development or fallback
        // return nodemailer.createTransport({
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: {
        //         user: process.env.EMAIL_USERNAME,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });
    }

    async send(template, subject) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // If production, use Brevo
        // if (process.env.NODE_ENV === 'production') {
            const sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            sendSmtpEmail.sender = { name: "KolPay", email: process.env.EMAIL_FROM };
            sendSmtpEmail.to = [{ email: this.to }];
            sendSmtpEmail.params = { parameter: this.userName, url: this.url };

            try {
                const apiInstance = this.newTransport(); // Brevo instance
                const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
                console.log('Email sent via Brevo:', JSON.stringify(data));
            } catch (error) {
                console.error('Error sending email via Brevo:', error);
            }
        // } else {
        //     // Use Nodemailer in development
        //     const mailOptions = {
        //         from: this.from,
        //         to: this.to,
        //         subject,
        //         html,
        //         text: htmlToText.convert(html)
        //     };

        //     await this.newTransport().sendMail(mailOptions);
        // }
    }

    async sendWelcome() {
        await this.send("welcome", "Welcome to our app");
    }

    async verifyAccount() {
        await this.send("verifyAccount", "Please verify your account");
    }

    async sendPasswordReset() {
        await this.send("passwordReset", "Reset Your Password");
    }

    async transactionAlert() {
        await this.send("transactionAlert", "Transaction Alert");
    }

    async newLoginAlert() {
        await this.send("newLoginAlert", "New Login Alert");
    }
};



// module.exports = class Email {
//     constructor(user, url) {
//         this.to = user.email;
//         this.url = url;
//         this.from = `KolPay <${process.env.EMAIL_FROM}>`;
//         this.userName = user.fullname.split(" ")[1];
        
//     }

//     // Initialize Brevo API client
//     newBrevoClient() {
//         const defaultClient = SibApiV3Sdk.ApiClient.instance;
//         const apiKey = defaultClient.authentications['api-key'];
//         apiKey.apiKey = process.env.BREVO_API_KEY; // Set your Brevo API key from environment variables
//         return new SibApiV3Sdk.TransactionalEmailsApi();
//     }

//     async send(template, subject) {
        
//         const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
//             firstName: this.firstName,
//             url: this.url,
//             subject
//         });

        
//         // Prepare email options for Brevo
//         const emailData = {
//             sender: { name: 'KolPay', email: process.env.EMAIL_FROM },
//             to: [{ email: this.to }],
//             subject: subject,
//             htmlContent: html,
//             textContent: htmlToText.convert(html)
//         };

//         // Send the email via Brevo
//         try {
//             const brevoClient = this.newBrevoClient();
//             const data = await brevoClient.sendTransacEmail(emailData);
//             console.log('Email sent successfully via Brevo: ', data);
//         } catch (error) {
//             console.error('Error sending email via Brevo: ', error);
//         }
//     }
    
//     async sendWelcome() {
//         await this.send("welcome", "Welcome to KolPay app");
//     }

//     async verifyAccount() {
//         await this.send("verifyAccount", "Welcome to our app")
//     }

//     async sendPasswordReset() {
//         await this.send("passwordReset", "Reset Your Password");
//     }

//     async transactionAlert() {
//         await this.send("transactionAlert", "Transaction Alert");
//     }

//     async newLoginAlert() {
//         await this.send("newLoginAlert", "New Login Alert");
//     }

// }





// module.exports = class Email {
//     constructor(user, url) {
//         this.to = user.email;
//         this.url = url;
//         this.from = `KolPay <${process.env.EMAIL_FROM}>`;
//         this.userName = user.fullname.split(" ")[1];
        
//     }

//     newTransport() {

//         if (process.env.NODE_ENV === 'production') {
//             // Sendgrid
//             return nodemailer.createTransport({
//               service: 'SendGrid',
//               auth: {
//                 user: process.env.SENDGRID_USERNAME,
//                 pass: process.env.SENDGRID_PASSWORD
//               }
//             });
//         }
        
//         return nodemailer.createTransport({
//             // service: "gmail",
//             // auth: {
//             //     user: process.env.EMAIL,
//             //     pass: process.env.EMAIL_PASSWORD
//             // }

//             host: process.env.EMAIL_HOST,
//             port: process.env.EMAIL_PORT,
//             auth: {
//               user: process.env.EMAIL_USERNAME,
//               pass: process.env.EMAIL_PASSWORD
//             }
            
//         });
//     }

//     async send(template, subject) {
        
//         const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
//             firstName: this.firstName,
//             url: this.url,
//             subject
//         });

//         const mailOptions = {
//             from: this.from,
//             to: this.to,
//             subject,
//             html,
//             text: htmlToText.fromString(html)
//         }

//         await this.newTransport().sendMail(mailOptions);
//     }

//     async sendWelcome() {
//         await this.send("welcome", "Welcome to our app");
//     }

//     async verifyAccount() {
//         await this.send("verifyAccount", "Welcome to our app")
//     }

//     async sendPasswordReset() {
//         await this.send("passwordReset", "Reset Your Password");
//     }

//     async transactionAlert() {
//         await this.send("transactionAlert", "Transaction Alert");
//     }

//     async newLoginAlert() {
//         await this.send("newLoginAlert", "New Login Alert");
//     }

// }