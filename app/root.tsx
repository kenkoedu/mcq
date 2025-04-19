import { Outlet } from "react-router";

import "./app.css";
import "./i18n";

import { Layout } from './components/Layout';
import { ErrorBoundary as CustomErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const ErrorBoundary = CustomErrorBoundary;
