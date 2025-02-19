import { Link, type LinkProps, type To, useLinkClickHandler } from 'react-router';
import { useTransitionContext } from '~/transition-context';
import { type MouseEvent, useEffect, useState } from 'react';
import { isSafari } from '~/lib/is-safari';

export const TransitionLink = ({
 children,
 onClick,
 to: toProp,
 viewTransition: viewTransitionProp,
 viewTransitionName,
 ...props
}: LinkProps & { viewTransitionName?: string}) => {
  const context = useTransitionContext();
  const [withViewTransition, setWithViewTransition] = useState(
    viewTransitionProp && !context?.hasUAVisualTransition && Boolean(document.startViewTransition)
  );
  const to = toProp === '-1' ? -1 as To: toProp;
  const linkHandler = useLinkClickHandler(to, {
    viewTransition: false
  });

  if (!context?.isViewTransitionEnabled) {
    return (
      <Link
        {...props}
        onClick={onClick}
        to={to}
      >
        {children}
      </Link>
    )
  }

  const onClickHandler = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
    if (context === null || !withViewTransition || !viewTransitionName) {
      linkHandler(e);
      return;
    }
    context?.setTransition(viewTransitionName);
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
    setWithViewTransition(viewTransitionProp && !context?.hasUAVisualTransition && Boolean(document.startViewTransition));
  }, [viewTransitionProp, context?.hasUAVisualTransition]);

  return (
    <Link
      {...props}
      onClick={onClickHandler}
      to={to}
    >
      {children}
    </Link>);
};
