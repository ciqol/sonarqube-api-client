import type { SonarError } from './types';

export async function createError(res: Response) {
  const msg = (await res.text()) || res.statusText;
  const errors = msg.startsWith('{"errors":[{') ? (JSON.parse(msg) as { readonly errors: { readonly msg: string }[] }).errors : [];

  return new SonarApiError(msg, res.status, res.statusText, errors);
}

class SonarApiError extends Error implements SonarError {
  constructor(
    override readonly message: string,
    readonly status: number,
    readonly error: string,
    readonly errors: { readonly msg: string }[],
  ) {
    super(message);
  }
}
