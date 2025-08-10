import { registerAs } from '@nestjs/config';

export default registerAs('vonage', () => ({

  apiKey: process.env.VONAGE_API_KEY || '',

  apiSecret: process.env.VONAGE_API_SECRET || '',

  fromNumber: process.env.VONAGE_FROM_NUMBER || '',

  enabled: process.env.VONAGE_ENABLED === 'true' || false,
})); 