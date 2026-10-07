import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsPostBoostsNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const promotionsPostBoostsNotFoundResponseResponse = z.lazy(() => {
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

export class PromotionsPostBoostsNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsPostBoostsNotFoundResponse {
    const error = new PromotionsPostBoostsNotFoundResponse(message, response);
    const result = promotionsPostBoostsNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsPostBoostsNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsPostBoostsNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
