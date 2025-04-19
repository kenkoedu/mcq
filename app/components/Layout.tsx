import React from 'react';
import { useTranslation } from 'react-i18next';
import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';
import { DisplaySettingsProvider } from '~/contexts/DisplaySettingsContext';
import NavbarContent from './NavbarContent'; // Import the separated NavbarContent

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language} dir={i18n.dir(i18n.language)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <DisplaySettingsProvider>
          <div className="no-print">
            <NavbarContent />
          </div>
          {children}
          <ScrollRestoration />
          <Scripts />
        </DisplaySettingsProvider>
      </body>
    </html>
  );
}
