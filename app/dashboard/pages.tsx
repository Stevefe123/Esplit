// app/dashboard/page.tsx
'use client'; // This page needs client-side logic (hooks, state)

import React from 'react';
import { useAuth } from '@/hooks/useAuth'; // Using our new hook
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Sign out function
  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/'); // Redirect to login page after sign out
  };

  // 1. Loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // 2. If not loading and no user, redirect
  if (!user) {
    router.push('/');
    return null; // Return null to prevent rendering the dashboard
  }

  // 3. If user is logged in, show the dashboard
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Upload Your Song</h2>
        <p className="text-gray-400 mb-6">Upload an MP3 or WAV file to get started.</p>
        {/* We will put the uploader component here later */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
          <p className="text-gray-500">File Uploader Coming Soon!</p>
        </div>
      </div>
    </div>
  );
}