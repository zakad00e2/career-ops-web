import { DEFAULT_TARGETS } from '@/lib/scan-targets';

// Company names available to scan — used by the Pipeline page to let the user
// pick which companies to include before running a scan.
export function GET() {
  return Response.json(DEFAULT_TARGETS.map(target => target.company));
}
