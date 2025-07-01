'use client';

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Uploader from '@/components/Uploader';

export default function DashboardPage() {
  const router = useRouter();

  // vvvv  THIS IS THE FUNCTION TO ADD vvvv
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to redirect even if there's an error
      router.push('/');
    }
  };
  // ^^^^ THE FUNCTION ENDS HERE ^^^^

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-xl sm:text-3xl font-bold truncate">
          Esplit Dashboard
        </h1>
        <button
          onClick={handleSignOut} // This button calls the function
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <Uploader />
    </div>
  );
}