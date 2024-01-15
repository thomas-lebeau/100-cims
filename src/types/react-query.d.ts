import {
  DefaultError,
  DefinedUseQueryResult,
  QueryClient,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";

type NonUndefinedGuard<T> = T extends undefined ? never : T;

type DefinedInitialDataOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  placeholderData:
    | NonUndefinedGuard<TQueryFnData>
    | (() => NonUndefinedGuard<TQueryFnData>);
};

/**
 * redeclare useQuery to allow proper typing when placeholderData is provided
 */

/* eslint-disable no-unused-vars */
declare module "@tanstack/react-query" {
  declare function useQuery<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError>;
}
/* eslint-enable */
