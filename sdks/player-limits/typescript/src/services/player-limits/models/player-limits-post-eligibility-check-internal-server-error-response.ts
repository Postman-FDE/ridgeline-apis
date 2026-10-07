import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPlayerLimitsPostEligibilityCheckInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const playerLimitsPostEligibilityCheckInternalServerErrorResponseResponse = z.lazy(() => {
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

export class PlayerLimitsPostEligibilityCheckInternalServerErrorResponse extends ThrowableError {
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
  ): PlayerLimitsPostEligibilityCheckInternalServerErrorResponse {
    const error = new PlayerLimitsPostEligibilityCheckInternalServerErrorResponse(
      message,
      response,
    );
    const result =
      playerLimitsPostEligibilityCheckInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof playerLimitsPostEligibilityCheckInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PlayerLimitsPostEligibilityCheckInternalServerErrorResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
