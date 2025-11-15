export type ControllerResult<T = any> =
  | {
      success: true;
      data: T;
      statusCode?: number;
    }
  | {
      success: false;
      error: string;
      details?: any;
      statusCode: number;
    };

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
