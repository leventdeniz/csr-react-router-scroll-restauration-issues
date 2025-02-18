import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { useLinkClickHandler, useLocation, useNavigate, useNavigation, useViewTransitionState } from 'react-router';

export const TransitionContext = React.createContext<({
  setTransition: (transition: string) => void;
  transition: string;
  hasUAVisualTransitionRef: boolean;
  setHasUAVisualTransitionRef: (hasUAVisualTransitionRef: boolean) => void;
}) | null>(null);

export const useTransitionContext = () => useContext(TransitionContext);

const TransitionContextProvider = ({ children, handler }:{ children: React.ReactNode; handler: (value: string) => void}) => {
  const transitionRef = useRef('');
  const [hasUAVisualTransition, setHasUAVisualTransition] = useState(false);
  const location = useLocation();

  const setTransition = (value: string) => {
    handler(value);
  }

  const setHasUAVisualTransitionRef = (value: boolean) => {
    setHasUAVisualTransition(value);
  };

  useLayoutEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setHasUAVisualTransition(event.hasUAVisualTransition)
      setTimeout(() => {
        setHasUAVisualTransitionRef(false);
      }, 100);
    }
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  return(
    <TransitionContext.Provider value={{
      setTransition,
      transition: transitionRef.current,
      hasUAVisualTransitionRef: hasUAVisualTransition,
      setHasUAVisualTransitionRef
    }}>
      {children}
    </TransitionContext.Provider>
  )
}

export default TransitionContextProvider;
