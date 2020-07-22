import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import gql from "graphql-tag";

const client = new ApolloClient({
  /* 
  The link property is filled by the ApolloLink.from command. This function walks through an array of links and initializes each of them, one by one:
  */
  link: ApolloLink.from([
    /* - The first link is the error link. It accepts a function that tells Apollo what should be done if an error occurs. */
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, location:${location}, path:${path}`
          );
          if (networkError) {
            console.log(`[Network error]: ${networkError}`);
          }
        });
      }
    }),
    /* 
    - The second link is the HTTP link for Apollo. You have to offer a URI, under which our Apollo or GraphQL server is reachable. 
    Apollo Client sends all requests to this URI. Notably, the order of execution is the same as the array that we just created.
    */
    new HttpLink({
      uri: "http://localhost:8000/graphql",
    }),
  ]),
  /*
    The cache property takes an implementation for caching. 
    One implementation can be the default package, InMemoryCache, or a different cache.
    There are many more properties that our links can understand (especially the HTTP link).
    They feature a lot of different customization options, which we will look at later. 
    You can also find them in the official documentation, at https://www.apollographql.com/docs/react/. 
    */
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
      {
        posts {
          id
          text
          user {
            avatar
            username
          }
        }
      }
    `,
  })
  .then((result) => console.log(result));
/* 
    loading, 
        as you might expect, indicates whether the query is still running or has already finished.
    networkStatus
        goes beyond this and gives you the exact status of what happened. 
        For example, the number seven indicates that there are no running queries that produce errors. 
        The number eight means that there has been an error. You can look up the other numbers in the official GitHub repository,
        at https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/networkStatus.ts.
    stale 
        is set whenever data is missing and is only partially available to the user.
*/
export default client;
