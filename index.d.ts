import { GraphQLClient } from 'graphql-request';
import { HttpRequestHandler } from 'postgraphile';

declare class PostgraphileClient extends GraphQLClient {
  constructor(postgraphile: HttpRequestHandler<any, any>);
  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T>;
}

export { PostgraphileClient };
