import { ReactNode } from 'react';
export interface AuthenticatedGuardProps {
  children: ReactNode;
  inProjectGuard?: boolean;
}
