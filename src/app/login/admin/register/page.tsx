'use client';

import AuthFormCard from '@/components/auth/AuthFormCard';
import RegistrationForm from '@/components/auth/RegistrationForm';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const AdminRegistrationPage = () => {
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, admin registration might be restricted.
    // For example, only an existing admin can create another admin,
    // or it's disabled after the first admin is created.
    // This example allows admin registration if not logged in, or if logged in as an admin.
    if (user && user.role !== 'admin') {
      // If logged in as non-admin, redirect away.
      redirect('/dashboard'); 
    }
  }, [user]);

  // If already logged in as a non-admin user, render nothing while redirecting.
  if (user && user.role !== 'admin') {
    return null; 
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <AuthFormCard
        title="Admin Registration"
        description="Create a new administrator account for Hall Hub."
        footerContent={
          <>
            Already an admin?{" "}
            <Link href="/login/admin" className="font-medium text-primary hover:underline">
              Login here
            </Link>
            .
          </>
        }
      >
        <RegistrationForm isAdminRegistration={true} />
      </AuthFormCard>
    </div>
  );
};

export default AdminRegistrationPage;
