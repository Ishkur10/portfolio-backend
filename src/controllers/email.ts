import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Define la interfaz para los datos del formulario
interface EmailRequestBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const sendContactEmail = async (req: Request, res: Response) => {
  console.log('Recibida solicitud para enviar correo:', req.body);
  
  try {
    const { name, email, subject, message } = req.body as EmailRequestBody;
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true
    });

    await transporter.verify();
    console.log('Server is ready to send messages');
    
    // Configurar el contenido del correo
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Enviar a tu propio correo
      replyTo: email, // Para poder responder directamente al remitente
      subject: subject || `Nuevo mensaje de ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Enviar el correo con manejo de promesa explícito
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado correctamente:', info.response);
    
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {  // Uso explícito de 'any' para el error
    console.error('Error al enviar el correo:', error);
    
    res.status(500).json({ 
      error: 'Error al enviar el correo',
      details: error.message,
      code: error.code
    });
  }
};