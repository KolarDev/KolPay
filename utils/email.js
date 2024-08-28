const nodemailer = require("nodemailer");

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.url = url;
        this.from = `KolPay <${process.env.EMAIL_FROM}>`;
        this.userName = user.fullname.split(" ")[1];
        
    }

    newTransport() {

        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
              }
            });
        }
        
        return nodemailer.createTransport({
            // service: "gmail",
            // auth: {
            //     user: process.env.EMAIL,
            //     pass: process.env.EMAIL_PASSWORD
            // }

            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD
            }
            
        });
    }

    async send(message, subject) {
        
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: message
        }

        await this.newTransport().sendMail(mailOptions);
    }

}