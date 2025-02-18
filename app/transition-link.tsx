import { Link, type LinkProps, useLinkClickHandler, useLocation, useNavigate, useViewTransitionState } from 'react-router';
import { useTransitionContext } from '~/transition-context';
import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

export const TransitionLink = ({ children, onClick, to, viewTransition: viewTransitionProp, ...props }: LinkProps) => {
  const context = useTransitionContext();
  const [withViewTransition, setWithViewTransition] = useState(
    viewTransitionProp && !context?.hasUAVisualTransitionRef && Boolean(document.startViewTransition)
  );
  const linkHandler = useLinkClickHandler(to, {
    viewTransition: false
  });

  const onForwardNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log({context, withViewTransition});
    if (/*context === null || */!withViewTransition) {
      linkHandler(e);
      return;
    }
    context?.setTransition('page-default-forward');
    document.startViewTransition(() => {
      linkHandler(e);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      })
    });
  };
/*
  useEffect(() => {
    console.log({ foo });
  }, [foo]);*/

  useEffect(() => {
    console.log("ref: ", context?.hasUAVisualTransitionRef);
    setWithViewTransition(viewTransitionProp && !context?.hasUAVisualTransitionRef && Boolean(document.startViewTransition));
  }, [viewTransitionProp, context?.hasUAVisualTransitionRef]);

  return (
    <Link
      to={to}
      {...props}
      onClick={onForwardNavigation}
    >
      {children}
      <span className="text-xs">vt: {withViewTransition ? 'true' : 'false'}</span>
    </Link>);
};
