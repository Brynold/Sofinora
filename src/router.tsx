import React from 'react';
import { Link as WouterLink, Route as WouterRoute, Switch, useLocation as useWouterLocation } from 'wouter';

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <Switch>{children}</Switch>;
}

export function Route({ path, element }: { path?: string; element: React.ReactNode }) {
  if (!path || path === '*') return <WouterRoute>{element}</WouterRoute>;
  return <WouterRoute path={path}>{element}</WouterRoute>;
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export function Link({ to, children, ...props }: LinkProps) {
  return <WouterLink href={to} {...props}>{children}</WouterLink>;
}

export function useLocation() {
  const [pathname] = useWouterLocation();
  return { pathname };
}

export function useNavigate() {
  const [, navigate] = useWouterLocation();
  return navigate;
}
