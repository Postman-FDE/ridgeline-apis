import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPlayerLimitsPostLimitsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const playerLimitsPostLimitsBadRequestResponseResponse = z.lazy(() => {
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

export class PlayerLimitsPostLimitsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PlayerLimitsPostLimitsBadRequestResponse {
    const error = new PlayerLimitsPostLimitsBadRequestResponse(message, response);
    const result = playerLimitsPostLimitsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof playerLimitsPostLimitsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PlayerLimitsPostLimitsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
