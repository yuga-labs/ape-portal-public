import { useErrorStore } from './useErrorStore';

export const useIsErrorSet = () => {
  const { error } = useErrorStore();
  return !!error;
};
