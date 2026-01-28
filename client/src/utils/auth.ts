import type { RootState } from '@/store/store';

export const getAuthHeaders = (state: RootState): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (state.auth.token) {
    headers['Authorization'] = `Token ${state.auth.token}`;
  }
  return headers;
};
