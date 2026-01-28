import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "http://localhost:9009/api";

// Helper to get URL params
// Google OAuth redirects to: http://localhost:5173/gmail/callback?code=...&state=...
// The OAuthCallbackHandler redirects to hash route: #/gmail/callback?code=...&state=...
function getUrlParams(): URLSearchParams {
  // First, check if we're still on the non-hash route (pathname) - this happens first
  if (window.location.pathname === '/gmail/callback' && window.location.search) {
    console.log('Found params in pathname/search:', window.location.search);
    return new URLSearchParams(window.location.search);
  }
  
  // Then check hash (after OAuthCallbackHandler redirects)
  const hash = window.location.hash;
  console.log('Checking hash:', hash);
  
  // Extract query params from hash: #/gmail/callback?code=...&state=...
  // Match pattern: #/gmail/callback?code=...&state=...
  const hashMatch = hash.match(/\/gmail\/callback\?(.+)$/);
  if (hashMatch) {
    console.log('Found params in hash:', hashMatch[1]);
    return new URLSearchParams(hashMatch[1]);
  }
  
  // Also try matching just the query string part: ?code=...&state=...
  const queryMatch = hash.match(/\?(.+)$/);
  if (queryMatch) {
    console.log('Found params in hash (query match):', queryMatch[1]);
    return new URLSearchParams(queryMatch[1]);
  }
  
  // Debug: log what we found
  console.log('Debug - Hash:', hash);
  console.log('Debug - Search:', window.location.search);
  console.log('Debug - Pathname:', window.location.pathname);
  console.log('Debug - Full URL:', window.location.href);
  
  return new URLSearchParams();
}

export default function GmailCallback() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Gmail connection...');

  const exchangeCode = async (code: string, state: string | null) => {
    try {
      setStatus('loading');
      setMessage('Saving Gmail tokens to database...');
      
      // Step 1: Exchange code and save tokens to database
      const response = await fetch(`${API_BASE_URL}/gmail/oauth2callback/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code, state }),
      });

      if (response.ok) {
        // Token is now saved in database (backend completed the save)
        setStatus('success');
        setMessage('Gmail account connected successfully! Redirecting...');
        
        // Step 2: Clean up URL and redirect to profile
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          // Clean the URL completely - remove all query params and pathname
          window.history.replaceState({}, '', '/');
          // Redirect to profile with clean URL
          window.location.href = '/#/profile';
        }, 1000);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to connect Gmail account. Please try again.');
        // Clean URL on error
        if (window.location.pathname === '/gmail/callback') {
          window.history.replaceState({}, '', '/');
        }
      }
    } catch (error) {
      console.error('Error exchanging code:', error);
      setStatus('error');
      setMessage('An error occurred while connecting your Gmail account. Please try again.');
      // Clean URL on error
      if (window.location.pathname === '/gmail/callback') {
        window.history.replaceState({}, '', '/');
      }
    }
  };

  useEffect(() => {
    // Extract params immediately - don't wait for OAuthCallbackHandler
    // We need to get params before they're cleaned up
    const params = getUrlParams();
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    console.log('Extracted params:', { 
      code: code ? 'present' : 'missing', 
      state: state || 'none',
      error: error || 'none'
    });

    // Clean up URL after extracting params (remove pathname and search)
    if (window.location.pathname === '/gmail/callback') {
      window.history.replaceState({}, '', '/');
    }

    // Check for OAuth error
    if (error) {
      setStatus('error');
      setMessage(`OAuth error: ${error}. Please try connecting again.`);
      return;
    }

    // Check for authorization code
    if (!code) {
      setStatus('error');
      setMessage('No authorization code received. Please try connecting again.');
      console.error('No code found. Full URL:', window.location.href);
      console.error('Pathname:', window.location.pathname);
      console.error('Search:', window.location.search);
      console.error('Hash:', window.location.hash);
      return;
    }

    // Small delay to ensure OAuthCallbackHandler has processed, then exchange code
    const timer = setTimeout(() => {
      // Exchange code for tokens - this will save to DB first, then redirect
      exchangeCode(code, state);
    }, 200); // Small delay to allow hash redirect

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <h2 className="text-xl font-semibold text-foreground">Connecting Gmail</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-success" />
                <h2 className="text-xl font-semibold text-foreground">Success!</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground">Connection Failed</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button
                  onClick={() => {
                    window.location.href = '/#/profile';
                  }}
                  className="mt-4"
                >
                  Go to Profile
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
