import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { prisma } from '../index';

export class MailService {
    private static async getTransporter() {
        // In a real app, these should be in .env
        // For now, if not provided, we can use a mock or fail gracefully
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;
        const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
        const port = Number(process.env.EMAIL_PORT) || 587;

        if (!user || !pass) {
            console.warn('Email credentials not provided. Notifications will be logged to console.');
            return null;
        }

        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }

    private static async getAdminEmail() {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'admin_notification_email' }
        });
        return setting?.value || "makerdigitally@gmail.com";
    }

    static async sendOrderConfirmation(order: any) {
        const adminEmail = await this.getAdminEmail();
        const pdfBuffer = await this.generateOrderPDF(order);

        const transporter = await this.getTransporter();

        const paymentMethodLabels: Record<string, string> = {
            'PAYMENT_ON_DELIVERY': 'Paiement à la livraison',
            'BANK_TRANSFER': 'Virement Bancaire',
            'STORE_PICKUP': 'Retrait au Showroom'
        };

        const readablePaymentMethod = paymentMethodLabels[order.paymentMethod] || order.paymentMethod;

        const orderItemsHtml = order.items.map((item: any) => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                    <div style="font-weight: bold; color: #333333;">${item.product.name}</div>
                    <div style="font-size: 12px; color: #666666;">Qté: ${item.quantity} × ${item.price} DH</div>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #333333;">
                    ${item.price * item.quantity} DH
                </td>
            </tr>
        `).join('');

        const getBankInstructions = () => {
            const ribInfo = process.env.BANK_RIB || '007 780 0000000000000000 00 (À remplacer dans .env)';
            const advanceAmount = order.finalAmount * 0.2;
            const remainingAmount = order.finalAmount - advanceAmount;

            if (order.paymentMethod === 'PAYMENT_ON_DELIVERY' || order.paymentMethod === 'STORE_PICKUP') {
                const methodText = order.paymentMethod === 'STORE_PICKUP' ? 'retrait au showroom' : 'paiement à la livraison';
                const onPlaceText = order.paymentMethod === 'STORE_PICKUP' ? 'au showroom lors du retrait' : 'directement à la livraison';
                return `
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #d97706; margin-top: 0; font-size: 16px;">Action requise : Avance de 20%</h3>
                        <p style="margin-bottom: 5px;">Pour valider votre commande en ${methodText}, veuillez transférer <strong>${advanceAmount.toLocaleString('fr-FR')} DH</strong> (20%) sur notre compte bancaire :</p>
                        <p style="font-family: monospace; font-size: 14px; background: #fff; padding: 10px; border: 1px solid #fde68a; border-radius: 4px; color: #1a1a1a;"><strong>RIB :</strong> ${ribInfo}</p>
                        <p style="margin-top: 5px; margin-bottom: 0;">Le reste de <strong>${remainingAmount.toLocaleString('fr-FR')} DH</strong> sera payé ${onPlaceText}.</p>
                    </div>
                `;
            } else if (order.paymentMethod === 'BANK_TRANSFER') {
                return `
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #2563eb; margin-top: 0; font-size: 16px;">Virement Bancaire</h3>
                        <p style="margin-bottom: 5px;">Votre commande sera traitée dès réception de votre virement du montant total de <strong>${order.finalAmount.toLocaleString('fr-FR')} DH</strong> sur notre compte :</p>
                        <p style="font-family: monospace; font-size: 14px; background: #fff; padding: 10px; border: 1px solid #bfdbfe; border-radius: 4px; color: #1a1a1a;"><strong>RIB :</strong> ${ribInfo}</p>
                    </div>
                `;
            }
            return '';
        };

        const getEmailTemplate = (title: string, greeting: string, showButton: boolean = true) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #444444; margin: 0; padding: 0; background-color: #f9f9f9; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .header { background: #1a1a1a; padding: 40px 20px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
                    .footer { background: #f1f5f9; padding: 30px; text-align: center; font-size: 12px; color: #64748b; }
                    .button { display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                    .total-row { font-size: 18px; font-weight: bold; color: #1a1a1a; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:logo" alt="Nexus Gaming" style="width: 150px;">
                    </div>
                    <div class="content">
                        <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">${title}</h1>
                        <p>${greeting}</p>
                        <p>Commande <strong>#${order.id.split('-')[0].toUpperCase()}</strong></p>
                        
                        <div class="order-box">
                            <h2 style="margin: 0 0 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Récapitulatif</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                ${orderItemsHtml}
                                <tr>
                                    <td style="padding: 20px 0 0; font-size: 16px;">Sous-total</td>
                                    <td style="padding: 20px 0 0; text-align: right; font-size: 16px;">${order.totalAmount} DH</td>
                                </tr>
                                ${order.discountAmount > 0 ? `
                                <tr>
                                    <td style="padding: 10px 0 0; color: #ef4444;">Réduction</td>
                                    <td style="padding: 10px 0 0; text-align: right; color: #ef4444;">-${order.discountAmount} DH</td>
                                </tr>
                                ` : ''}
                                <tr class="total-row">
                                    <td style="padding: 15px 0 0; border-top: 2px solid #1a1a1a;">TOTAL</td>
                                    <td style="padding: 15px 0 0; text-align: right; border-top: 2px solid #1a1a1a; color: #3b82f6;">${order.finalAmount} DH</td>
                                </tr>
                            </table>
                        </div>

                        <p><strong>Détails du client :</strong><br>
                        ${order.customerName}<br>
                        ${order.customerPhone}<br>
                        ${order.address}<br>
                        ${order.city}</p>

                        <p><strong>Mode de paiement :</strong> ${readablePaymentMethod}</p>
                        ${getBankInstructions()}

                        ${showButton ? `
                        <div style="text-align: center;">
                            <a href="https://nexus-gaming.ma/account/orders" class="button">Suivre ma commande</a>
                        </div>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Nexus Gaming. Tous droits réservés.</p>
                        <p>Nexus Gaming HQ, Casablanca, Maroc</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"Nexus Gaming" <${process.env.EMAIL_USER || 'noreply@nexus-gaming.com'}>`,
            to: order.customerEmail,
            subject: `Confirmation de commande #${order.id.split('-')[0].toUpperCase()} - Nexus Gaming`,
            html: getEmailTemplate('Merci pour votre commande !', `Bonjour <strong>${order.customerName}</strong>, votre commande a été reçue avec succès et est en cours de traitement.`),
            attachments: [
                {
                    filename: `Commande_${order.id.split('-')[0].toUpperCase()}.pdf`,
                    content: pdfBuffer
                },
                {
                    filename: 'logo.png',
                    path: '/Users/abdelmonaimoulaid/Documents/Work/Nexus Gaming/website/public/logo.png',
                    cid: 'logo'
                }
            ]
        };

        const adminMailOptions = {
            from: `"Nexus Gaming System" <${process.env.EMAIL_USER || 'noreply@nexus-gaming.com'}>`,
            to: adminEmail,
            subject: `Nouvelle Commande Reçue #${order.id.split('-')[0].toUpperCase()}`,
            html: getEmailTemplate('Nouvelle Commande !', `Une nouvelle commande a été passée par <strong>${order.customerName}</strong> (${order.customerEmail}).`, false),
            attachments: [
                {
                    filename: `Commande_${order.id.split('-')[0].toUpperCase()}.pdf`,
                    content: pdfBuffer
                },
                {
                    filename: 'logo.png',
                    path: '/Users/abdelmonaimoulaid/Documents/Work/Nexus Gaming/website/public/logo.png',
                    cid: 'logo'
                }
            ]
        };

        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
                await transporter.sendMail(adminMailOptions);
            } catch (error) {
                console.error('Error sending emails:', error);
            }
        } else {
            console.log('--- EMAIL MOCK ---');
            console.log(`To: ${order.customerEmail}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Admin Mail To: ${adminEmail}`);
            console.log('------------------');
        }
    }

    static async generateOrderPDF(order: any): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: any[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // --- Header & Branding ---
            const logoPath = '/Users/abdelmonaimoulaid/Documents/Work/Nexus Gaming/website/public/logo.png';
            try {
                doc.image(logoPath, 50, 45, { width: 100 });
            } catch (e) {
                doc.fontSize(20).fillColor('#3b82f6').font('Helvetica-Bold').text('NEXUS GAMING', 50, 45);
            }

            doc.fillColor('#444444')
                .fontSize(20)
                .text('INVOICE / FACTURE', 50, 100, { align: 'right' })
                .fontSize(10)
                .text(`Order # / Commande #: ${order.id.split('-')[0].toUpperCase()}`, 50, 125, { align: 'right' })
                .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 140, { align: 'right' })
                .moveDown();

            // --- Horizontal Line ---
            doc.moveTo(50, 160).lineTo(550, 160).strokeColor('#eeeeee').stroke();

            // --- Customer & Company Info ---
            doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold').text('Nexus Gaming', 50, 180);
            doc.font('Helvetica').text('Nexus Gaming HQ', 50, 195);
            doc.text('Casablanca, Maroc', 50, 210);
            doc.text('bessaha@abdelmounaimoulaid.com', 50, 225);

            doc.font('Helvetica-Bold').text('Bill To / Facturer à:', 350, 180);
            doc.font('Helvetica').text(order.customerName, 350, 195);
            doc.text(order.customerEmail, 350, 210);
            doc.text(order.customerPhone, 350, 225);
            if (order.address) {
                doc.text(`${order.address}, ${order.city || ''}`, 350, 240, { width: 200 });
            }

            doc.moveDown(4);

            // --- Items Table ---
            let tableTop = doc.y + 20;
            if (tableTop < 280) tableTop = 280;

            doc.font('Helvetica-Bold').fillColor('#3b82f6');
            doc.text('Item / Produit', 50, tableTop);
            doc.text('Price / Prix', 300, tableTop, { width: 80, align: 'right' });
            doc.text('Qty / Qté', 400, tableTop, { width: 50, align: 'right' });
            doc.text('Total', 480, tableTop, { width: 70, align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#3b82f6').lineWidth(2).stroke();

            let itemY = tableTop + 25;
            doc.font('Helvetica').fillColor('#000000').lineWidth(1);

            order.items.forEach((item: any) => {
                doc.text(item.product.name, 50, itemY, { width: 240 });
                doc.text(`${item.price} DH`, 300, itemY, { width: 80, align: 'right' });
                doc.text(item.quantity.toString(), 400, itemY, { width: 50, align: 'right' });
                doc.text(`${item.price * item.quantity} DH`, 480, itemY, { width: 70, align: 'right' });

                itemY += 25;
                // Draw a thin separator
                doc.moveTo(50, itemY - 5).lineTo(550, itemY - 5).strokeColor('#f5f5f5').stroke();
            });

            // --- Totals Section ---
            const totalsY = itemY + 20;
            doc.font('Helvetica').text('Subtotal / Sous-total:', 350, totalsY, { width: 120, align: 'right' });
            doc.text(`${order.totalAmount} DH`, 480, totalsY, { width: 70, align: 'right' });

            let currentY = totalsY + 20;
            if (order.discountAmount > 0) {
                doc.text('Discount / Réduction:', 350, currentY, { width: 120, align: 'right' });
                doc.fillColor('#ef4444').text(`-${order.discountAmount} DH`, 480, currentY, { width: 70, align: 'right' });
                doc.fillColor('#000000');
                currentY += 20;
            }

            doc.font('Helvetica-Bold').fontSize(12).fillColor('#3b82f6');
            doc.text('Grand Total:', 350, currentY, { width: 120, align: 'right' });
            doc.text(`${order.finalAmount} DH`, 480, currentY, { width: 70, align: 'right' });

            // --- Footer ---
            doc.fontSize(10).fillColor('#aaaaaa').font('Helvetica').text('Thank you for choosing Nexus Gaming / Merci de votre confiance.', 50, 700, { align: 'center' });
            doc.text('www.nexus-gaming.ma', 50, 715, { align: 'center' });

            doc.end();
        });
    }
}
