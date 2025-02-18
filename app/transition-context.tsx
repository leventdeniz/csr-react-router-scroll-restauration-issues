import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { useLinkClickHandler, useLocation, useNavigate, useNavigation, useViewTransitionState } from 'react-router';

export const TransitionContext = React.createContext<({
  setTransition: (transition: string) => void;
  transition: string;
  hasUAVisualTransitionRef: boolean;
  setHasUAVisualTransitionRef: (hasUAVisualTransitionRef: boolean) => void;
}) | null>(null);

export const useTransitionContext = () => useContext(TransitionContext);

const TransitionContextProvider = ({ children, handler }:{ children: React.ReactNode}) => {
  const transitionRef = useRef('');
  const hasUAVisualTransitionRef = useRef(false);
  const [hasUAVisualTransition, setHasUAVisualTransition] = useState(false);
  const location = useLocation();

  const setTransition = (value: string) => {
    // console.log('setTransition', value);
    handler(value);
    // transitionRef.current = value;
  }

  const setHasUAVisualTransitionRef = (value: boolean) => {
    // hasUAVisualTransitionRef.current = value;
    setHasUAVisualTransition(value);
  };

  useLayoutEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // console.log('event.hasUAVisualTransition: ', event.hasUAVisualTransition);
      // hasUAVisualTransitionRef.current = event.hasUAVisualTransition;
      setHasUAVisualTransition(event.hasUAVisualTransition)
      setTimeout(() => {
        // console.log('setHasUAVisualTransitionRef(false)');
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
