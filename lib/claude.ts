import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export const MODEL = 'claude-opus-4-5';
export const FAST_MODEL = 'claude-haiku-4-5';
