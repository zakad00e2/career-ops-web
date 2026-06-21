import { createHash } from 'node:crypto';

export const LAST_SCANNED_CV_FINGERPRINT_KEY = '__lastScannedCvFingerprint';

export function fingerprintCv(cv?: string): string {
  return createHash('sha256').update((cv ?? '').trim()).digest('hex');
}

export function shouldClearPendingJobs(
  previousFingerprint: string | undefined,
  currentFingerprint: string,
): boolean {
  return Boolean(previousFingerprint && previousFingerprint !== currentFingerprint);
}

export function initialFingerprintForCvChange(
  existingCv: string | undefined,
  nextCv: string | undefined,
  storedFingerprint: string | undefined,
): string | undefined {
  if (storedFingerprint || nextCv === undefined) return undefined;
  if ((existingCv ?? '').trim() === nextCv.trim()) return undefined;
  return fingerprintCv(existingCv);
}
