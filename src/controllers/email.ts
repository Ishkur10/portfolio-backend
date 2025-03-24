import { Request, Response } from 'express';

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
    
    // El resto de tu código se mantiene igual...
    // ...
  } catch (error: any) {  // Uso explícito de 'any' para el error
    console.error('Error al enviar el correo:', error);
    
    res.status(500).json({ 
      error: 'Error al enviar el correo',
      details: error.message,
      code: error.code
    });
  }
};