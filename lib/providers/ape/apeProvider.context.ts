import { createContext, useContext } from 'react';
import { ApeConfig } from './apeProvider';

export type ApeProviderContext = ApeConfig | undefined;

export const ApeContext = createContext<ApeProviderContext>(undefined);

export const useApeContext = () => {
  const context = useContext(ApeContext);
  if (!context) {
    throw new Error('useApeProvider must be used within a ApeProvider');
  }
  return context;
};
