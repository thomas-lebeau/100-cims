import {
  DefaultError,
  DefinedUseInfiniteQueryResult,
  DefinedUseQueryResult,
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

type NonUndefinedGuard<T> = T extends undefined ? never : T;

type DefinedPlaceholderDataOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  placeholderData:
    | NonUndefinedGuard<TQueryFnData>
    | (() => NonUndefinedGuard<TQueryFnData>);
};

type DefinedPlaceholderDataInfiniteOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = UseInfiniteQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryFnData,
  TQueryKey,
  TPageParam
> & {
  placeholderData:
    | NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>
    | (() => NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>);
};

/**
 * redeclare (overload) useQuery and useInfiniteQuery to allow proper typing when placeholderData is provided
 */

/* eslint-disable no-unused-vars */
declare module "@tanstack/react-query" {
  declare function useQuery<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: DefinedPlaceholderDataOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey
    >,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError>;

  declare function useInfiniteQuery<
    TQueryFnData,
    TError = DefaultError,
    TData = InfiniteData<TQueryFnData>,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
  >(
    options: DefinedPlaceholderDataInfiniteOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >,
    queryClient?: QueryClient
  ): DefinedUseInfiniteQueryResult<TData, TError>;
}
/* eslint-enable */
