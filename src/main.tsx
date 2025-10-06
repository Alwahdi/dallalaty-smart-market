import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'

Sentry.init({
  dsn: "https://094d3647a4e34a19a05605eed29fc45a@o4508854051995648.ingest.us.sentry.io/4510144696483840",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
