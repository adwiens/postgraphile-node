# postgraphile-node

Query Postgraphile from the same Node app.

## Usage

```js
import { PostgraphileClient } from 'postgraphile-node';
import postgraphile from 'postgraphile';
import { gql } from 'graphql-request'

const middleware = postgraphile('postgres://user:pass@your-host/db-name');
const client = new PostgraphileClient(middleware);

const query = gql`
  {
    Movie(title: "Inception") {
      releaseDate
      actors {
        name
      }
    }
  }
`;

client.request(query).then((data) => console.log(data));
```

## What it does

This library provides `PostgraphileClient`. It's a drop-in replacement for the GraphQLClient class in [graphql-request](https://www.npmjs.com/package/graphql-request) that allows you to send GQL queries directly to Postgraphile without any network requests.

## Why would anyone want to do this

Postgraphile is great for auto-generating a public GraphQL API, but there isn't a good way to access the database internally from the same Node server. You need to do this often when customizing the API, for example with custom plugins.

Postgraphile provides its internal Postgres client to custom plugins, but accessing the database this way requires writing and maintaining blocks of SQL, which is best avoided.

You could make HTTP requests to Postgraphile's `/graphql` endpoint, but that would have the app make HTTP requests to itself. It can work, but it's a bit hacky.

Another option is to add another database connector like TypeORM, Sequelize, or Prisma to access the database, but then you are having to adopt yet another technology in addition to Postgraphile, which isn't DRY.

## Detecting whether a query came from PostgraphileClient

`PostgraphileClient` adds a boolean property `isInternalQuery` to the mocked `req` object that can be used to detect whether the query came from this library.

The following example shows how to use `isInternalQuery` with `graphql-shield` to break the infinite loop caused by querying Postgraphile from its own schema:

```js
import postgraphile from 'postgraphile';
import { rule } from 'graphql-shield';

const middleware = postgraphile('postgres://user:pass@your-host/db-name', {
  async additionalGraphQLContextFromRequest(req: any) {
    return {
      isInternalQuery: req.isInternalQuery || false
    };
  }
});

const yourRule = rule({ cache: 'no_cache' })(
  async (parent, args, ctx, info) => {
    // ctx.isInternalQuery is true here if the query was from PostgraphileClient.
  }
);
```

This approach can be used anywhere the GraphQL context object is available, such as in Postgraphile plugins.
