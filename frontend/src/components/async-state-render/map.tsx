import { ReactElement } from 'react';
import { AsyncState } from 'react-use/lib/useAsyncFn';

export type ReturnType = ReactElement;

export interface AsyncStateRenderProps<T> {
  state: AsyncState<T>;
  onSuccess: (response: NonNullable<T>) => ReturnType;
}
