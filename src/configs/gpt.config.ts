import { registerAs } from '@nestjs/config';

export default registerAs('gpt', () => ({
    apiKey: process.env.GPT_API_KEY || '',
}));
