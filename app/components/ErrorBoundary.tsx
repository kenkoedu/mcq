import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Layout } from './Layout'; // Import the separated Layout

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  let message = t('error.unexpected.title', "Oops!");
  let details = t('error.unexpected.details', "An unexpected error occurred.");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? t('error.404.title', "404") : t('error.generic.title', "Error");
    details =
      error.status === 404
        ? t('error.404.details', "The requested page could not be found.")
        : error.statusText || t('error.generic.details', "An error occurred.");
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Layout>
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </Layout>
  );
}
