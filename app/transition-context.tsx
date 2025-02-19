import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { isSafari } from '~/lib/is-safari';

export const TransitionContext = React.createContext<({
  setTransition: (transition: string) => void;
  transition: string;
  hasUAVisualTransition: boolean;
  isViewTransitionEnabled: boolean;
}) | null>(null);

export const useTransitionContext = () => useContext(TransitionContext);

type TransitionContextProviderProps = {
  children: React.ReactNode;
  setViewTransitionPropertyHandler: (value: string) => void;
  isViewTransitionEnabled?: boolean;
}

const TransitionContextProvider = ({
  children,
  setViewTransitionPropertyHandler,
  isViewTransitionEnabled = true
}: TransitionContextProviderProps) => {
  const currentIndex = useRef(0);
  const transitionRef = useRef('');
  const [hasUAVisualTransition, setHasUAVisualTransition] = useState(false);
  const location = useLocation();

  const setTransition = (value: string) => {
    setViewTransitionPropertyHandler(value);
  }

  useLayoutEffect(() => {
    if (!isViewTransitionEnabled) {
      return;
    }
    const handlePopState = (event: PopStateEvent) => {
      const newIndex = event.state?.idx || 0;

      if (event.hasUAVisualTransition || isSafari) {
        requestAnimationFrame(() => {
          transitionRef.current = '';
          setViewTransitionPropertyHandler('');
        })
      } else {
        if (newIndex < currentIndex.current) {
          transitionRef.current = 'page-default-backward';
        } else if (newIndex > currentIndex.current) {
          transitionRef.current = 'page-default-forward';
        }
        setViewTransitionPropertyHandler(transitionRef.current);
        document.startViewTransition();
      }

      currentIndex.current = newIndex;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  useLayoutEffect(() => {
    if (!isViewTransitionEnabled) {
      return;
    }
    const handlePopState = (event: PopStateEvent) => {
      setHasUAVisualTransition(event.hasUAVisualTransition);
      if (event.hasUAVisualTransition) {
        setTimeout(() => {
          setHasUAVisualTransition(false);
        }, 100);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  useLayoutEffect(() => {
    currentIndex.current = history.state?.idx || 0;
  }, [location]);

  useEffect(() => {
    history.scrollRestoration = isSafari ? "auto" : 'manual';
  }, [location]);

  return(
    <TransitionContext.Provider value={{
      setTransition,
      transition: transitionRef.current,
      hasUAVisualTransition,
      isViewTransitionEnabled,
    }}>
      {children}
    </TransitionContext.Provider>
  )
}

export default TransitionContextProvider;
