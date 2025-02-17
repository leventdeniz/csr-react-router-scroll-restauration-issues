import React, { useContext, useLayoutEffect, useRef } from 'react';
import { useLinkClickHandler, useLocation, useNavigate, useNavigation, useViewTransitionState } from 'react-router';

export const TransitionContext = React.createContext<({ setTransition: (transition: string) => void; transition: string; hasUAVisualTransitionRef: boolean }) | null>(null);

export const useTransitionContext = () => useContext(TransitionContext);

const TransitionContextProvider = ({ children, handler }:{ children: React.ReactNode}) => {
  const transitionRef = useRef('');
  const hasUAVisualTransitionRef = useRef(false);
  const location = useLocation();

  const setTransition = (value: string) => {
    console.log('setTransition', value);
    handler(value);
    // transitionRef.current = value;
  }

  useLayoutEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('event.hasUAVisualTransition: ', event.hasUAVisualTransition);
      hasUAVisualTransitionRef.current = event.hasUAVisualTransition;
    }
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  return(
    <TransitionContext.Provider value={{ setTransition, transition: transitionRef.current, hasUAVisualTransitionRef: hasUAVisualTransitionRef.current }}>
      {children}
    </TransitionContext.Provider>
  )
}

export default TransitionContextProvider;
