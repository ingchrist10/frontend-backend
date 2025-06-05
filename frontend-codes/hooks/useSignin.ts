utation } from '@tanstack/react-query';
import { LoginFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import authWebSocketService from '@/services/auth-websocket';

interface SigninResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: any;
    tokens: {
      refresh: string;
      access: string;
    };
  };
}

// Custom hook for signin mutation
export const useSigninMutation = () => {
  const router = useRouter();

  return useMutation<SigninResponse, Error, LoginFormData>({
    mutationFn: async (data) => {
      await authWebSocketService.connect();
      const response = await authWebSocketService.signIn(data.email, data.password);
      authWebSocketService.disconnect();
      return response;
    },
    
    onSuccess: (data) => {
      if (data.status === 'success' && data.data) {
        // Store tokens in localStorage or secure storage
        localStorage.setItem('access_token', data.data.tokens.access);
        localStorage.setItem('refresh_token', data.data.tokens.refresh);
        
        console.log('Login successful:', data);

      toast.success('Welcome!', {
        description: `Account created successfully for`,
      });
    },
    
    onError: (error) => {
    console.error('Signin failed:', error.message);
    toast.error('Signup Failed', {
        description: error.message || 'Something went wrong. Please try again.',
        duration: 5000,
      });
    },
    
  
  } );
};