import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPlayerLimitsPostEligibilityCheckNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const playerLimitsPostEligibilityCheckNotFoundResponseResponse = z.lazy(() => {
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

export class PlayerLimitsPostEligibilityCheckNotFoundResponse extends ThrowableError {
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
  ): PlayerLimitsPostEligibilityCheckNotFoundResponse {
    const error = new PlayerLimitsPostEligibilityCheckNotFoundResponse(message, response);
    const result = playerLimitsPostEligibilityCheckNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof playerLimitsPostEligibilityCheckNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PlayerLimitsPostEligibilityCheckNotFoundResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
