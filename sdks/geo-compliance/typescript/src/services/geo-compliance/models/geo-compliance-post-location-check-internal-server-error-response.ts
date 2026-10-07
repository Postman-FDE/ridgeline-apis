import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IGeoCompliancePostLocationCheckInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const geoCompliancePostLocationCheckInternalServerErrorResponseResponse = z.lazy(() => {
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

export class GeoCompliancePostLocationCheckInternalServerErrorResponse extends ThrowableError {
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
  ): GeoCompliancePostLocationCheckInternalServerErrorResponse {
    const error = new GeoCompliancePostLocationCheckInternalServerErrorResponse(message, response);
    const result =
      geoCompliancePostLocationCheckInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof geoCompliancePostLocationCheckInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = GeoCompliancePostLocationCheckInternalServerErrorResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
