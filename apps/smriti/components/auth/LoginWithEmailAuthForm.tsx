'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/app/auth/actions';
import { FormInputField } from '../form/FormInputField';
import { AppForm } from '../form/AppForm';
import type { EmailFormValues } from './validations';
import { emailFormSchema } from './validations';
import { toast } from 'sonner';

const LoginWithEmailAuthForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const onSubmit = async ({ email }: EmailFormValues) => {
    setIsLoading(true);

    const { error } = await signInWithEmail(email);

    try {
      if (error) {
        toast(error.message);
        return;
      }

      toast('Check Your Email');
      push('/');
    } catch (err) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <AppForm onSubmit={onSubmit} schema={emailFormSchema}>
        <div className='flex flex-col gap-4'>
          <FormInputField<EmailFormValues>
            label='Email'
            path='email'
            placeholder='name@example.com'
          />
          <Button type='submit' loading={isLoading}>
            Sign In
          </Button>
        </div>
      </AppForm>
    </div>
  );
};
export default LoginWithEmailAuthForm;
