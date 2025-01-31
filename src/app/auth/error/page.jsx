'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Frown } from 'lucide-react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errors = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  };

  const errorMessage = error ? errors[error] || errors.Default : errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <Frown className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{errorMessage}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
