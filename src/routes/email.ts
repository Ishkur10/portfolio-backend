import express from 'express';
import { sendContactEmail } from '../controllers/email';

const router = express.Router();

// Ruta para enviar correos desde el formulario de contacto
router.post('/send-email', sendContactEmail);

// Ruta de prueba para verificar que la API está funcionando
router.get('/test', (req, res) => {
  res.json({ message: 'La API de correos está funcionando correctamente' });
});

export default router;