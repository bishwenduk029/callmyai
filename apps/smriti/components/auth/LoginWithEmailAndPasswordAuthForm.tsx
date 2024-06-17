'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from '@/app/auth/actions';
import { FormInputField } from '../form/FormInputField';
import { AppForm } from '../form/AppForm';
import type { LoginEmailAndPasswordFormValues } from './validations';
import { loginWithEmailAndPasswordSchema } from './validations';
import { toast } from 'sonner';

const LoginWithEmailAndPasswordAuthForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const onSubmit = async (formValues: LoginEmailAndPasswordFormValues) => {
    setIsLoading(true);

    const { error } = await signInWithEmailAndPassword(formValues);

    try {
      if (error) {
        toast(error.message);
        return;
      }

      toast('Login successful!');
      push('/');
    } catch (err) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <AppForm onSubmit={onSubmit} schema={loginWithEmailAndPasswordSchema}>
        <div className='flex flex-col gap-4'>
          <FormInputField<LoginEmailAndPasswordFormValues>
            label='Email'
            path='email'
            placeholder='name@example.com'
          />

          <div className='flex flex-col gap-1'>
            <FormInputField<LoginEmailAndPasswordFormValues>
              label='Password'
              path='password'
              placeholder='********'
              type='password'
            />
            <p className='text-right text-xs text-muted-foreground'>
              <Link
                className='hover:text-brand hover:underline hover:underline-offset-4'
                href='/auth/forgot-password'
              >
                Forgot your password?
              </Link>
            </p>
          </div>
          <Button loading={isLoading} type='submit'>
            Sign In
          </Button>
        </div>
      </AppForm>
    </div>
  );
};
export default LoginWithEmailAndPasswordAuthForm;
