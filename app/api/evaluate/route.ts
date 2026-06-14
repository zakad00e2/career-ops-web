import { NextRequest } from 'next/server';
import { getAnthropic, MODEL } from '@/lib/claude';
import { buildEvaluationPrompt } from '@/lib/modes';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, cvContent, profileContent } = await req.json();

    if (!jobDescription) {
      return Response.json({ error: 'jobDescription is required' }, { status: 400 });
    }
    if (!cvContent) {
      return Response.json({ error: 'cvContent is required — add your CV in Settings first' }, { status: 400 });
    }

    const systemPrompt = buildEvaluationPrompt(cvContent, profileContent || '');
    const anthropic = getAnthropic();

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please evaluate this job posting:\n\n${jobDescription}`,
        },
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
