import { registerAs } from '@nestjs/config';

export default registerAs('firecrawl', () => ({
    apiKey: process.env.FIRECRAWL_API_KEY || '',
}));
