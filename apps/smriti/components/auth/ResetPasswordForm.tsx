import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/app/auth/actions';
import { AppForm } from '../form/AppForm';
import type { ResetPasswordFormValues } from '@/components/auth/validations/ResetPasswordSchema';
import { resetPasswordSchema } from '@/components/auth/validations/ResetPasswordSchema';
import { FormInputField } from '@/components/form/FormInputField';
import { toast } from 'sonner';

export const ResetPasswordForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();

  const onSubmit = async ({ password }: ResetPasswordFormValues) => {
    setIsLoading(true);
    const { error } = await updatePassword(password);

    try {
      if (error) {
        toast(error.message);
        return;
      }

      toast('Password updated!');
      push('/');
    } catch (err) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <AppForm onSubmit={onSubmit} schema={resetPasswordSchema}>
        <div className='flex flex-col gap-4'>
          <FormInputField<ResetPasswordFormValues>
            label='Password'
            path='password'
            placeholder='********'
            type='password'
          />
          <FormInputField<ResetPasswordFormValues>
            label='Confirm password'
            path='confirmPassword'
            placeholder='********'
            type='password'
          />
          <Button loading={isLoading} type='submit'>
            Reset
          </Button>
        </div>
      </AppForm>
    </div>
  );
};
