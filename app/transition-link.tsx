import { Link, type LinkProps, useLinkClickHandler, useLocation, useNavigate, useViewTransitionState } from 'react-router';
import { useTransitionContext } from '~/transition-context';
import { type MouseEvent, useEffect, useLayoutEffect, useRef } from 'react';

export const TransitionLink = ({ children, onClick, to, viewTransition: viewTransitionProp, ...props }: LinkProps) => {
  const context = useTransitionContext();
  const foo = useViewTransitionState(to);
  const navigate = useNavigate();
  const linkHandler = useLinkClickHandler(to, { viewTransition: viewTransitionProp && !context?.hasUAVisualTransitionRef });

  const onForwardNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    if (context === null || !Boolean(document.startViewTransition) || !viewTransitionProp) {
      return;
    }
    context.setTransition('page-default-forward');
  };

  useEffect(() => {
    console.log({ foo });
  }, [foo]);

  return (
    <Link
      to={to}
      {...props}
      onClick={onForwardNavigation}
      viewTransition={viewTransitionProp && !context?.hasUAVisualTransitionRef}
    >
      {children}
    </Link>);
};
