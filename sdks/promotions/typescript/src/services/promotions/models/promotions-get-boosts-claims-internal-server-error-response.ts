import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsGetBoostsClaimsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const promotionsGetBoostsClaimsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class PromotionsGetBoostsClaimsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(
    message: string,
    response?: unknown,
  ): PromotionsGetBoostsClaimsInternalServerErrorResponse {
    const error = new PromotionsGetBoostsClaimsInternalServerErrorResponse(message, response);
    const result = promotionsGetBoostsClaimsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsGetBoostsClaimsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsGetBoostsClaimsInternalServerErrorResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
