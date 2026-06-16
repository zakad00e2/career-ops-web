import { EvaluateClient } from './EvaluateClient';

export default async function EvaluatePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  return <EvaluateClient initialUrl={url ?? ''} />;
}
