import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsPostBoostsClaimNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const promotionsPostBoostsClaimNotFoundResponseResponse = z.lazy(() => {
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

export class PromotionsPostBoostsClaimNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsPostBoostsClaimNotFoundResponse {
    const error = new PromotionsPostBoostsClaimNotFoundResponse(message, response);
    const result = promotionsPostBoostsClaimNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsPostBoostsClaimNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsPostBoostsClaimNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
