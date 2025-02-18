import { Link, type LinkProps, useLinkClickHandler } from 'react-router';
import { useTransitionContext } from '~/transition-context';
import { type MouseEvent, useEffect, useState } from 'react';

export const TransitionLink = ({ children, onClick, to, viewTransition: viewTransitionProp, ...props }: LinkProps) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const context = useTransitionContext();
  const [withViewTransition, setWithViewTransition] = useState(
    viewTransitionProp && !context?.hasUAVisualTransitionRef && Boolean(document.startViewTransition)
  );
  const linkHandler = useLinkClickHandler(to, {
    viewTransition: false
  });

  const onForwardNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (context === null || !withViewTransition) {
      linkHandler(e);
      return;
    }
    context?.setTransition('page-default-forward');
    document.startViewTransition(() => {
      linkHandler(e);
      if (isSafari) {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        })
      }
    });
  };

  useEffect(() => {
    setWithViewTransition(viewTransitionProp && !context?.hasUAVisualTransitionRef && Boolean(document.startViewTransition));
  }, [viewTransitionProp, context?.hasUAVisualTransitionRef]);

  return (
    <Link
      to={to}
      {...props}
      onClick={onForwardNavigation}
    >
      {children}
    </Link>);
};
