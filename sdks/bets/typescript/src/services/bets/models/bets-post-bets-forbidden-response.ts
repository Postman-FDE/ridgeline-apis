import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsPostBetsForbiddenResponseSchema = {
  error: string;
  message: string;
};

export const betsPostBetsForbiddenResponseResponse = z.lazy(() => {
  return z
    .object({
      error: z.string(),
      message: z.string(),
    })
    .transform((data) => ({
      error: data['error'],
      message: data['message'],
    }));
});

export class BetsPostBetsForbiddenResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsPostBetsForbiddenResponse {
    const error = new BetsPostBetsForbiddenResponse(message, response);
    const result = betsPostBetsForbiddenResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsPostBetsForbiddenResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsPostBetsForbiddenResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
