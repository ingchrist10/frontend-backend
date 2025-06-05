import { useimport { useMutation } from '@tanstack/react-query';
import { SignupFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import authWebSocketService from '@/services/auth-websocket';

interface SignupResponse {
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

// Custom hook for signup mutation
export const useSignupMutation = () => {
  const router = useRouter();

  return useMutation<SignupResponse, Error, SignupFormData>({
    mutationFn: async (data) => {
      await authWebSocketService.connect();
      const response = await authWebSocketService.signUp(data.email, data.password);
      authWebSocketService.disconnect();
      return response;
    },
    
    onSuccess: (data) => {
      if (data.status === 'success' && data.data) {
        // Store tokens in localStorage or secure storage
        localStorage.setItem('access_token', data.data.tokens.access);
        localStorage.setItem('refresh_token', data.data.tokens.refresh);
        
        console.log('Signup successful:', data);

      toast.success('Welcome!', {
        description: `Account created successfully for`,
      });
    },
    
    onError: (error) => {
    console.error('Signup failed:', error.message);
    toast.error('Signup Failed', {
        description: error.message || 'Something went wrong. Please try again.',
        duration: 5000,
      });
    },
    
  
  } );
};