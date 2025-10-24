/**
 * Global Error Handler Utilities
 * 
 * Centralized error handling for API errors
 */

import { APIError } from '../contracts/operationTable.contract';

/**
 * Check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '不明なエラーが発生しました';
}

/**
 * Get error status code
 */
export function getErrorStatus(error: unknown): number {
  if (isAPIError(error)) {
    return error.statusCode ?? 500;
  }
  return 500;
}

/**
 * Log error to console with context
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '';
  
  if (isAPIError(error)) {
    console.error(`${prefix} API Error:`, {
      message: error.message,
      status: error.statusCode,
      details: error.details,
    });
  } else if (error instanceof Error) {
    console.error(`${prefix} Error:`, error.message);
  } else {
    console.error(`${prefix} Unknown error:`, error);
  }
}

/**
 * Error boundary fallback component helper
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  details?: any;
} {
  if (isAPIError(error)) {
    return {
      title: `エラー (${error.statusCode})`,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'エラー',
      message: error.message,
    };
  }

  return {
    title: 'エラー',
    message: '不明なエラーが発生しました',
  };
}
