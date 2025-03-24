import express from 'express';
import { sendContactEmail } from '../controllers/email';

const router = express.Router();

// Usando el tipo 'any' explícitamente para evitar problemas de inferencia
router.post('/send-email', (req: any, res: any) => {
  sendContactEmail(req, res);
});

router.get('/test', (req, res) => {
  res.json({ message: 'La API de correos está funcionando correctamente' });
});

export default router;