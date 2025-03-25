// src/routes/email.ts
import express from 'express';
import { sendContactEmail, sendTestEmail } from '../controllers/email';

const router = express.Router();

// Regular contact form endpoint
router.post('/send-email', (req, res) => {
  sendContactEmail(req, res);
});

// Test email endpoint
router.get('/test-email', (req, res) => {
  sendTestEmail(req, res);
});

router.get('/test', (req, res) => {
  res.json({ message: 'La API de correos está funcionando correctamente' });
});

export default router;