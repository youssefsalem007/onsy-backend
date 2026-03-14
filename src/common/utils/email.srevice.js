import nodemailer from "nodemailer"
import { EMAIL, EMAIL_PASSWORD } from "../../../config/config.service.js"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
})

export const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `Onsy App <${EMAIL}>`,
        to,
        subject,
        html
    })
}