import type { ReactNode } from 'react';
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './actions';

const PublicAuthLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (user) return redirect('/');

  return <> {children} </>;
};

export default PublicAuthLayout;
