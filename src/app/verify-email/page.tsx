'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { verifyEmail } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const performVerifyEmail = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email successfully verified!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || err.message || 'An error occurred during verification. Please try again later.');
      }
    };

    performVerifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {status === 'loading' && (
        <div className="animate-fade-in">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Verifying your email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-fade-in max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white">Email Verified!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">{message}</p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Continue to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-fade-in max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white">Verification Failed</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">{message}</p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center px-6 py-3 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl font-medium transition-colors text-gray-900 dark:text-white"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <p className="text-gray-500 text-lg animate-pulse">Loading verification module...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
