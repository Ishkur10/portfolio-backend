import express from 'express';
import { sendContactEmail } from '../controllers/email';

const router = express.Router();

// Usar una función intermedia para evitar problemas de tipos
router.post('/send-email', async (req, res) => {
  return await sendContactEmail(req, res);
});

router.get('/test', (req, res) => {
  res.json({ message: 'La API de correos está funcionando correctamente' });
});

export default router;