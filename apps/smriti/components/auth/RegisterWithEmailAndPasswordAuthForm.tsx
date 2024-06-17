'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { signUpWithEmailAndPassword } from '@/app/auth/actions';
import { AppForm } from '@/components/form/AppForm';
import { FormInputField } from '@/components/form/FormInputField';
import type { RegisterEmailAndPasswordFormValues } from '@/components/auth/validations';
import { registerWithEmailAndPasswordSchema } from '@/components/auth/validations';
import { toast } from 'sonner';
import { LoginButton } from '../login-button';

export const RegisterWithEmailAndPasswordAuthForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const onSubmit = async ({
    email,
    password,
  }: RegisterEmailAndPasswordFormValues) => {
    setIsLoading(true);

    const { error } = await signUpWithEmailAndPassword({ email, password });

    try {
      if (error) {
        toast(error.message);
        return;
      }

      toast('User created!');
      push('/auth/login');
    } catch (err) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <AppForm onSubmit={onSubmit} schema={registerWithEmailAndPasswordSchema}>
        <div className='flex flex-col gap-4'>
          <FormInputField<RegisterEmailAndPasswordFormValues>
            label='Email'
            path='email'
            placeholder='name@example.com'
          />
          <FormInputField<RegisterEmailAndPasswordFormValues>
            label='Password'
            path='password'
            placeholder='********'
            type='password'
          />
          <FormInputField<RegisterEmailAndPasswordFormValues>
            label='Confirm password'
            path='confirmPassword'
            placeholder='********'
            type='password'
          />
          <Button loading={isLoading} type='submit'>
            Register
          </Button>
        </div>
      </AppForm>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>
      <LoginButton />
    </div>
  );
};
