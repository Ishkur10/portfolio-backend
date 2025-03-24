import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Interfaz para los errores de nodemailer
interface EmailError extends Error {
  code?: string;
  command?: string;
  response?: string;
}

export const sendContactEmail = async (req: Request, res: Response) => {
  console.log('Recibida solicitud para enviar correo:', req.body);
  
  try {
    const { name, email, subject, message } = req.body;
    
    // Validación básica
    if (!name || !email || !message) {
      console.log('Validación fallida: campos requeridos faltantes');
      return res.status(400).json({ error: 'Por favor, complete todos los campos requeridos' });
    }
    
    // Comprobación de variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('ERROR: Variables de entorno de correo no definidas');
      return res.status(500).json({ error: 'Configuración de correo incompleta' });
    }
    
    console.log('Configurando transporte de correo...');
    
    // Configuración del transporte de correo
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('Verificando conexión con el servidor SMTP...');
    
    // Verificar la conexión
    try {
      await transporter.verify();
      console.log('Conexión con servidor SMTP verificada correctamente');
    } catch (error) {
      // Convertir error a EmailError para TypeScript
      const verifyError = error as EmailError;
      
      console.error('Error al verificar la conexión SMTP:', verifyError);
      return res.status(500).json({ 
        error: 'No se pudo conectar con el servidor de correo', 
        details: verifyError.message,
        code: verifyError.code
      });
    }
    
    console.log('Preparando opciones de correo...');
    
    // Configuración del correo
    const mailOptions = {
      from: `"Formulario de Contacto" <${process.env.EMAIL_USER}>`,
      to: 'iliasouazani@gmail.com', // Tu dirección de correo
      replyTo: email,
      subject: subject || `Nuevo mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje: ${message}`,
      html: `
        <h3>Nuevo mensaje del formulario de contacto</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    console.log('Enviando correo...');
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo enviado correctamente:', {
      messageId: info.messageId,
      response: info.response
    });
    
    res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    // Convertir error a EmailError para TypeScript
    const emailError = error as EmailError;
    
    console.error('Error al enviar el correo:', emailError);
    
    res.status(500).json({ 
      error: 'Error al enviar el correo',
      details: emailError.message,
      code: emailError.code
    });
  }
};