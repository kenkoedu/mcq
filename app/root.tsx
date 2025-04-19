import { Outlet, HashRouter } from "react-router"; // Import HashRouter

import "./app.css";
import "./i18n";

import { Layout } from './components/Layout';
import { ErrorBoundary as CustomErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    // Wrap the Layout with HashRouter
    <HashRouter>
      <Layout>
        <Outlet />
      </Layout>
    </HashRouter>
  );
}

export const ErrorBoundary = CustomErrorBoundary;
