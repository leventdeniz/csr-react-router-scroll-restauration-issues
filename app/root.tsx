import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLocation,
} from 'react-router';

import type { Route } from "./+types/root";
import "./app.css";
import React, { useEffect, useRef } from 'react';
import TransitionContextProvider from '~/transition-context';

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const transitionRef = useRef('');
  const htmlElementRef = useRef<HTMLHtmlElement>(null);

  useEffect(() => {
    history.scrollRestoration = "auto";
  }, [location]);

  const setTransition = (value: string) => {
    console.log('setTransition', value);
    if (transitionRef.current) {
      htmlElementRef.current?.style.removeProperty("view-transition-name");
    }
    htmlElementRef.current?.style.setProperty("view-transition-name", value);
    transitionRef.current = value;
  }

  return (
    <html lang="en" ref={htmlElementRef}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <TransitionContextProvider handler={setTransition}>
        {children}
      </TransitionContextProvider>
      {/*<ScrollRestoration />*/}
      {/*{scrollRestorationRef.current === "manual" ? <ScrollRestoration/> : null}*/}
      <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <div className="ruler">100vh marker</div>
      <Outlet/>
      <div className="scrollRestoration">scrollRestoration: "{window.history.scrollRestoration}"</div>
    </>);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
