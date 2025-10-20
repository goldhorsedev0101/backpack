// server/email.ts - Email service using Gmail SMTP
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface HotelInquiryEmail {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  budget: string;
  phone: string;
  email: string;
  notes?: string;
  whatsappConsent: boolean;
}

export async function sendHotelInquiryEmail(inquiry: HotelInquiryEmail) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'support@globemate.co.il',
    subject: `🏨 פנייה חדשה למבצעי מלונות - ${inquiry.destination}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #f97316; text-align: center; margin-bottom: 30px;">🏨 פנייה חדשה למבצעי מלונות</h1>
          
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #f97316;">
            <h2 style="color: #ea580c; margin-top: 0;">פרטי הנסיעה</h2>
            <p><strong>יעד:</strong> ${inquiry.destination}</p>
            <p><strong>תאריך כניסה:</strong> ${new Date(inquiry.checkIn).toLocaleDateString('he-IL')}</p>
            <p><strong>תאריך יציאה:</strong> ${new Date(inquiry.checkOut).toLocaleDateString('he-IL')}</p>
            <p><strong>מספר לילות:</strong> ${Math.ceil((new Date(inquiry.checkOut).getTime() - new Date(inquiry.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</p>
            <p><strong>מבוגרים:</strong> ${inquiry.adults}</p>
            <p><strong>ילדים:</strong> ${inquiry.children}</p>
            <p><strong>תקציב:</strong> ${inquiry.budget}</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0;">פרטי הלקוח</h2>
            <p><strong>📧 אימייל:</strong> <a href="mailto:${inquiry.email}" style="color: #0ea5e9;">${inquiry.email}</a></p>
            <p><strong>📱 טלפון:</strong> <a href="tel:${inquiry.phone}" style="color: #0ea5e9;">${inquiry.phone}</a></p>
            <p><strong>💬 הסכמה לוואטסאפ:</strong> ${inquiry.whatsappConsent ? '✅ כן' : '❌ לא'}</p>
          </div>
          
          ${inquiry.notes ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #f59e0b;">
            <h2 style="color: #d97706; margin-top: 0;">הערות נוספות</h2>
            <p style="white-space: pre-wrap;">${inquiry.notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">פנייה התקבלה ב-${new Date().toLocaleString('he-IL')}</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
              מערכת GlobeMate - פלטפורמת תכנון נסיעות<br/>
              <a href="https://globemate.co.il" style="color: #f97316;">www.globemate.co.il</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}
