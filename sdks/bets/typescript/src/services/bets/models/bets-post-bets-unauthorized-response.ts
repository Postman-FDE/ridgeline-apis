import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsPostBetsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const betsPostBetsUnauthorizedResponseResponse = z.lazy(() => {
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

export class BetsPostBetsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsPostBetsUnauthorizedResponse {
    const error = new BetsPostBetsUnauthorizedResponse(message, response);
    const result = betsPostBetsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsPostBetsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsPostBetsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
