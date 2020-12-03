import { GraphQLClient } from 'graphql-request';
import { createRequest, createResponse } from 'node-mocks-http';

/**
 * Drop-in replacement for GraphQLClient. Uses the Postgraphile middleware
 * object directly without a network request.
 */
class PostgraphileClient extends GraphQLClient {
  constructor(postgraphile) {
    this.postgraphile = postgraphile;
    super('');
  }

  async request(query, variables) {
    return new Promise((resolve) => {
      const req = createRequest();
      const res = createResponse();
      req._setBody({ query, variables: variables || undefined });
      req._setMethod('POST');
      req._setURL('/graphql');
      res.end = ((result) => resolve(JSON.parse(result).data)); // TODO: error handling
      req.isInternalQuery = true;
      this.postgraphile(req, res);
    });
  }
}

export { PostgraphileClient };
