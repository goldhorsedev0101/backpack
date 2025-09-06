/**
 * יוטיל לtimeout - למניעת "תקיעות" בפעולות התחברות
 */
export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), ms)
    )
  ]);
}