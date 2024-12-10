import path from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import { twig, renderFile } from 'twig';

import { isEmpty } from '../utils/isEmpty';

import { title } from 'process';
import BaseContext from '../di/BaseContext';

export const TRANSPORT_MAIL = 'mail';
export const TRANSPORT_SMTP = 'smtp';
export const TRANSPORT_GMAIL = 'gmail';

interface SendProps {
    template: string | any,
    from?: string
    to: string | string[],
    subject: string,
    title: string,
    description: string,
    params: any,

}

export default class Mail extends BaseContext {

    public send({
        template, from = "base", to, subject, title, description, params
    }: SendProps) {
        const {config} = this.di
        if (config.dev || process.env.DEBUG_MODE === 'true') {
            to = config.mail.debug;
        }
        to = Array.isArray(to) ? to : [to];

        const mailFrom = config.mail.from[from];
        const mailOptions = {
            from: `${mailFrom.name} <${mailFrom.email}>`,
            to: to.join(),
            subject,
            html: '',
            headers: {
                'X-ExclaimerHostedSignatures-MessageProcessed': 'value'
            }
        };


        const templateName = typeof template === 'object' ? template.name : template;
        //params.publicUrl = params.action !== null ? (config.baseUrl + '/' + params.action) : null;
        return new Promise((resolve, reject) => {
            if (!isEmpty(subject)) {
                mailOptions.subject = subject;
            }
            let emailTitle = title;
            let content = description;

            // if template have params > var description have nested variables
            if (params && params.length > 0) {

                // title may contain variables, if not have vars -> return string
                const eTitle = twig({
                    data: title,
                });
                emailTitle = eTitle.render(params);

                // description
                const mailDescription = twig({
                    data: description,
                });
                content = mailDescription.render(params);
            }

            // TODO 123 remove old params.title = templateFromDb && templateFromDb.title;
            params.title = emailTitle;
            params.description = content;
            params.url = config.baseUrl;
            // params.companyName = companyInfo && companyInfo.companyName && companyInfo.companyName;
            params.companyName = config.siteName;
            params.companyLogo = "/logo.png"

            renderFile(
                path.resolve(`server/emails/${templateName}.twig`),
                params,
                (err, html) => {
                    if (err) {
                        this.di.logger.mailerError("RENDER EMAIL`s FILE", err?.message ?? "Error")
                        reject({ success: false, err });
                    } else {
                        mailOptions.html = html;
                        let transporter: Transporter | null = null;
                        switch (config.mail.transport) {
                        case TRANSPORT_SMTP:
                            transporter = nodemailer.createTransport({
                                host: config.mail.smtp.server,
                                port: config.mail.smtp.port,
                                secure: config.mail.smtp.security, // true for 465, false for other ports
                                auth: {
                                    user: config.mail.smtp.username,
                                    pass: config.mail.smtp.password,
                                },
                            });
                            break;
                        case TRANSPORT_GMAIL:
                            transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: config.mail.gmail.username,
                                    pass: config.mail.gmail.password,
                                },
                            });
                            break;
                        case TRANSPORT_MAIL:
                            transporter = nodemailer.createTransport({
                                sendmail: true,
                                newline: 'unix',
                                path: '/usr/sbin/sendmail',
                            });
                            break;
                        default:
                            break;
                        }
                        if (transporter) {
                            transporter.sendMail(mailOptions, (error: any, info: any) => {
                                if (error) {
                                    this.di.logger.mailerError("SENDING MAIL", error?.message ?? "Error")
                                    reject({ success: false, error });
                                } else {
                                    resolve({
                                        success: true,
                                        data: 'Email message sent: ' + info,
                                    });
                                }
                            });
                        } else {
                            this.di.logger.mailerError("SENDING MAIL", 'Email transporter is empty')
                            reject({ success: false, error: 'Email transporter is empty' });
                        }
                    }
                });
        })
    }

}
