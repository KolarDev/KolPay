const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");


module.exports = class Email {
    constructor(user, url, transaction, moreArg) {
        this.to = user.email;
        this.url = url;
        this.user = user
        this.from = `KolPay <${process.env.EMAIL_FROM}>`;
        this.firstName = user.fullname.split(" ")[1];
        this.transaction = transaction;
        this.moreArg = moreArg
    }
    
    newTransport() {
        
        return nodemailer.createTransport({

            host: process.env.BREVO_HOST,
            port: process.env.BREVO_PORT,
            auth: {
              user: process.env.BREVO_USERNAME,
              pass: process.env.BREVO_PASSWORD
            }
            
        });
    }


    async send(template, subject) {
        
        const html = await ejs.renderFile(`${__dirname}/../views/emails/${template}.ejs`, {
            user: this.user,
            firstName: this.firstName,
            url: this.url,
            subject,
            transaction: this.transaction,
            moreArg: this.moreArg
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        }

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send("welcome", "Welcome to KolPay");
    }

    async verifyAccount() {
        await this.send("verifyAccount", "Welcome to KolPay")
    }


    async sendPasswordReset() {
        await this.send("passwordReset", "Reset Your Password");
    }

    async creditAlert() {
        await this.send("creditAlert", "Transaction Alert");
    }

    async debitAlert() {
        await this.send("debitAlert", "Transaction Alert");
    }

    async newLoginAlert() {
        await this.send("newLoginAlert", "New Login Alert");
    }

}
