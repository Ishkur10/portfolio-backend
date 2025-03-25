// File: src/routes/email.ts

import express from 'express';
import { sendContactEmail, sendTestEmail } from '../controllers/email';

const router = express.Router();

// Regular contact form endpoint
router.post('/send-email', (req: any, res: any) => {
  sendContactEmail(req, res);
});

// Add a test endpoint
router.get('/test-email', (req: any, res: any) => {
  sendTestEmail(req, res);
});

router.get('/test', (req, res) => {
  res.json({ message: 'La API de correos está funcionando correctamente' });
});

export default router;