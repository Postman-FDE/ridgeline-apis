import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsGetBoostsClaimsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const promotionsGetBoostsClaimsBadRequestResponseResponse = z.lazy(() => {
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

export class PromotionsGetBoostsClaimsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsGetBoostsClaimsBadRequestResponse {
    const error = new PromotionsGetBoostsClaimsBadRequestResponse(message, response);
    const result = promotionsGetBoostsClaimsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsGetBoostsClaimsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsGetBoostsClaimsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
