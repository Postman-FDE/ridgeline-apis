import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsGetBetsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const betsGetBetsUnauthorizedResponseResponse = z.lazy(() => {
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

export class BetsGetBetsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsGetBetsUnauthorizedResponse {
    const error = new BetsGetBetsUnauthorizedResponse(message, response);
    const result = betsGetBetsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsGetBetsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsGetBetsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
