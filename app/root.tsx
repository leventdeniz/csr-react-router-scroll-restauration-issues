import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useLocation, useRouteLoaderData,
} from 'react-router';

import type { Route } from "./+types/root";
import "./app.css";
import { scrollRestorationCookie } from '~/cookies';
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const cookie =
    (await scrollRestorationCookie.parse(request.headers.get("Cookie"))) ??
    "auto";
  const scrollRestorationParam =
    new URL(request.url).searchParams.get("scrollRestoration") ?? cookie;
  const scrollRestoration: typeof history.scrollRestoration =
    scrollRestorationParam === "auto" || scrollRestorationParam === "manual"
    ? scrollRestorationParam
    : "auto";
  return data(
    { scrollRestoration },
    {
      headers: {
        "Set-Cookie": await scrollRestorationCookie.serialize(
          scrollRestoration
        ),
      },
    }
  );
};

/*export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}*/

let scrollRestoration: typeof history.scrollRestoration = "auto";

const TransitionContext = React.createContext<({ setTransition: (transition: string) => void; transition: string }) | null>(null);

export const useTransitionContext = () => useContext(TransitionContext);

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  useEffect(() => {
    const value = data?.scrollRestoration ?? scrollRestoration;
    history.scrollRestoration = value;
    scrollRestoration = value;
  }, [data?.scrollRestoration]);

  const location = useLocation();
  const currentIndex = useRef(0); // Track the current index
  const transitionRef = useRef('');
  const htmlElementRef = useRef<HTMLHtmlElement>(null);

  useLayoutEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const newIndex = event.state?.idx || 0;

      if (transitionRef.current) {
        htmlElementRef.current?.style.removeProperty("view-transition-name");
      }
      if (event.hasUAVisualTransition) {
        console.log('UA visual transition');
        transitionRef.current = '';
        htmlElementRef.current?.style.removeProperty("view-transition-name");
      } else {
        if (newIndex < currentIndex.current) {
          console.log('Back navigation');
          transitionRef.current = 'page-default-backward';
        } else if (newIndex > currentIndex.current) {
          console.log('Forward navigation');
          transitionRef.current = 'page-default-forward';
        }
        htmlElementRef.current?.style.setProperty("view-transition-name", transitionRef.current);
      }

      // Update the current index
      currentIndex.current = newIndex;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  useLayoutEffect(() => {
    currentIndex.current = history.state?.idx || 0;
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
      {scrollRestoration === "manual" ? <ScrollRestoration/> : null}
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
