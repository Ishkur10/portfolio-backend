// File: src/controllers/email.ts

import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Define the interface for the form data
interface EmailRequestBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Helper type to check for NodeMailer errors
interface NodemailerError {
  name: string;
  message: string;
  code?: string;
}

// Type guard to check if an error has the right properties
function isNodemailerError(error: unknown): error is NodemailerError {
  return (
    typeof error === 'object' && 
    error !== null && 
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export const sendContactEmail = async (req: Request, res: Response) => {
  console.log('Recibida solicitud para enviar correo:', req.body);
  
  try {
    const { name, email, subject, message } = req.body as EmailRequestBody;
    
    // Log configuration details to help with debugging
    console.log('Email configuration:');
    console.log(`- Using EMAIL_USER: ${process.env.EMAIL_USER?.substring(0, 3)}...`);
    console.log(`- EMAIL_PASSWORD length: ${process.env.EMAIL_PASSWORD?.length || 0} characters`);
    
    // Create transporter with explicit configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });
    
    // Verify connection before sending
    try {
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('✓ SMTP connection successfully verified');
    } catch (verifyError: unknown) {
      console.error('✗ SMTP connection verification failed:', verifyError);
      
      // TypeScript-safe error handling
      const errorMessage = isNodemailerError(verifyError) 
        ? verifyError.message 
        : 'Unknown error during SMTP verification';
      
      const errorCode = isNodemailerError(verifyError) && verifyError.code 
        ? verifyError.code 
        : 'UNKNOWN';
      
      return res.status(500).json({ 
        error: 'Failed to connect to email server',
        details: errorMessage,
        code: errorCode
      });
    }
    
    // Configure email content
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
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
    
    // Send the email with detailed logging
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✓ Email sent successfully!');
    console.log(`- Message ID: ${info.messageId}`);
    console.log(`- Response: ${info.response}`);
    
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error: unknown) {
    // Comprehensive error logging with TypeScript safety
    console.error('✗ Error sending email:');
    
    if (isNodemailerError(error)) {
      console.error(`- Error type: ${error.name}`);
      console.error(`- Error message: ${error.message}`);
      console.error(`- Error code: ${error.code || 'N/A'}`);
      
      // Additional SMTP-specific error handling
      if (error.code === 'EAUTH') {
        console.error('Authentication failed. Check your Gmail username and password.');
      } else if (error.code === 'ESOCKET') {
        console.error('Socket error. Check your connection and port settings.');
      }
    } else {
      console.error('- Unknown error type:', error);
    }
    
    const errorDetails = isNodemailerError(error) ? error.message : 'Unknown error';
    const errorCode = isNodemailerError(error) && error.code ? error.code : 'UNKNOWN';
    
    res.status(500).json({ 
      error: 'Error al enviar el correo',
      details: errorDetails,
      code: errorCode
    });
  }
};

// Add a test endpoint to directly test email functionality
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    console.log('Testing email functionality...');
    
    // Use the same configuration as the contact form
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });
    
    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified for test email');
    
    // Simple test message
    const info = await transporter.sendMail({
      from: `"Test Email" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Portfolio Backend',
      text: 'This is a test email. If you received this, your email configuration is working!',
      html: '<h2>Test Email</h2><p>This is a test email. If you received this, your email configuration is working!</p><p>Time sent: ' + new Date().toISOString() + '</p>'
    });
    
    console.log('Test email sent:', info.messageId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId, 
      response: info.response 
    });
  } catch (error: unknown) {
    console.error('Failed to send test email:', error);
    
    const errorDetails = isNodemailerError(error) ? error.message : 'Unknown error';
    const errorCode = isNodemailerError(error) && error.code ? error.code : 'UNKNOWN';
    
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: errorDetails,
      code: errorCode
    });
  }
};