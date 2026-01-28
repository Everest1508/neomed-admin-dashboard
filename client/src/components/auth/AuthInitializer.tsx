import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth, setLoading } from '@/store/slices/authSlice';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (token) {
      // If we have a token, check if it's valid
      dispatch(checkAuth(token));
    } else {
      // No token, set loading to false immediately
      dispatch(setLoading(false));
    }
  }, [dispatch, token]); // Include dependencies

  return null;
}
