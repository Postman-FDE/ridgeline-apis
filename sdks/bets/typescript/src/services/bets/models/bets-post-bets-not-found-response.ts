import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsPostBetsNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const betsPostBetsNotFoundResponseResponse = z.lazy(() => {
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

export class BetsPostBetsNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsPostBetsNotFoundResponse {
    const error = new BetsPostBetsNotFoundResponse(message, response);
    const result = betsPostBetsNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsPostBetsNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsPostBetsNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
