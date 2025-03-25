// src/controllers/email.ts
import { Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

// Define the interface for the form data
interface EmailRequestBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const sendContactEmail = async (req: Request, res: Response) => {
  console.log('Received contact form submission:', req.body);
  
  try {
    const { name, email, subject, message } = req.body as EmailRequestBody;
    
    // Configure SendGrid with API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    
    // Log that we're using SendGrid (without exposing the key)
    console.log('Using SendGrid for email delivery');
    console.log(`- Sending to: ${process.env.EMAIL_USER}`);
    
    // Create the email message
    const msg = {
      to: process.env.EMAIL_USER || 'iliasouazani@gmail.com', // Your email
      from: process.env.SENDGRID_VERIFIED_SENDER || 'iliasouazani@gmail.com', // Must be verified in SendGrid
      subject: subject || `New message from ${name}`,
      replyTo: email, // Allows you to reply directly to the sender
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Send the email
    console.log('Sending email via SendGrid...');
    const response = await sgMail.send(msg);
    
    console.log('Email sent successfully!');
    console.log(`- Status Code: ${response[0].statusCode}`);
    console.log(`- Headers: ${JSON.stringify(response[0].headers)}`);
    
    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully'
    });
  } catch (error: unknown) {
    // Handle errors properly
    console.error('Failed to send email:', error);
    
    // Check for SendGrid-specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as any;
      console.error('SendGrid API error details:');
      if (sgError.response && sgError.response.body) {
        console.error(JSON.stringify(sgError.response.body, null, 2));
      }
    }
    
    // Return error response
    res.status(500).json({ 
      error: 'Error al enviar el correo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Test endpoint to verify email configuration
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    console.log('Testing email functionality with SendGrid...');
    
    // Configure SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    
    // Send a test email
    const msg = {
      to: process.env.EMAIL_USER || 'iliasouazani@gmail.com',
      from: process.env.SENDGRID_VERIFIED_SENDER || 'iliasouazani@gmail.com',
      subject: 'Test Email from Portfolio Backend',
      text: `This is a test email sent at ${new Date().toISOString()}`,
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your portfolio backend.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    };
    
    const response = await sgMail.send(msg);
    console.log('Test email sent successfully!');
    console.log(`- Status: ${response[0].statusCode}`);
    
    res.status(200).json({ 
      success: true, 
      statusCode: response[0].statusCode,
      message: 'Test email sent successfully'
    });
  } catch (error: unknown) {
    console.error('Failed to send test email:', error);
    
    // Detailed error for SendGrid errors
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as any;
      if (sgError.response && sgError.response.body) {
        console.error('SendGrid error details:', sgError.response.body);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};