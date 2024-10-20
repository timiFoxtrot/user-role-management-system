export function SuccessResponse(
  message: string,
  payload?: { data: any; },
  statusCode?: number,
  meta?: object,
) {
  return {
    success: true,
    message,
    statusCode: statusCode || 200,
    ...payload,
    meta,
  };
}
export function ErrorResponse(message: string, statusCode?: number, payload?: object) {
  return {
    success: false,
    message,
    statusCode,
    errors: payload,
  };
}
