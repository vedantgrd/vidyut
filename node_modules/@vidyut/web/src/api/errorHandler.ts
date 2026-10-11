import { useToastStore } from '@/store/toastStore';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: unknown) => {
  const { addToast } = useToastStore.getState();

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        addToast({ type: 'error', title: 'Invalid Request', message: error.message || 'Please check your inputs and try again.' });
        break;
      case 401:
        // 401s are usually handled by interceptors (e.g. logging out), but we can toast here if needed
        addToast({ type: 'error', title: 'Unauthorized', message: 'Your session has expired. Please log in again.' });
        break;
      case 403:
        addToast({ type: 'warning', title: 'Access Denied', message: 'You do not have permission to perform this action.' });
        break;
      case 404:
        addToast({ type: 'error', title: 'Not Found', message: 'The requested resource could not be found.' });
        break;
      case 422:
        addToast({ type: 'error', title: 'Validation Error', message: error.message || 'The provided data was invalid.' });
        break;
      case 429:
        addToast({ type: 'warning', title: 'Too Many Requests', message: 'Please slow down and try again later.' });
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        addToast({ type: 'error', title: 'Server Error', message: 'Our servers are experiencing issues. Please try again later.' });
        break;
      default:
        addToast({ type: 'error', title: 'Unexpected Error', message: error.message || 'Something went wrong.' });
    }
  } else if (error instanceof Error) {
    if (error.name === 'AbortError') {
      // Ignore abort errors
      return;
    }
    addToast({ type: 'error', title: 'Error', message: error.message });
  } else {
    addToast({ type: 'error', title: 'Error', message: 'An unknown error occurred.' });
  }
};
