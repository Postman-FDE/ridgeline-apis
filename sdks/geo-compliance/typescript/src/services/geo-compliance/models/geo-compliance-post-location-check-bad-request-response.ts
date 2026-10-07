import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IGeoCompliancePostLocationCheckBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const geoCompliancePostLocationCheckBadRequestResponseResponse = z.lazy(() => {
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

export class GeoCompliancePostLocationCheckBadRequestResponse extends ThrowableError {
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
  ): GeoCompliancePostLocationCheckBadRequestResponse {
    const error = new GeoCompliancePostLocationCheckBadRequestResponse(message, response);
    const result = geoCompliancePostLocationCheckBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof geoCompliancePostLocationCheckBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = GeoCompliancePostLocationCheckBadRequestResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
