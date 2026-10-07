import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsGetBetsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const betsGetBetsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class BetsGetBetsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsGetBetsInternalServerErrorResponse {
    const error = new BetsGetBetsInternalServerErrorResponse(message, response);
    const result = betsGetBetsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsGetBetsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsGetBetsInternalServerErrorResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
