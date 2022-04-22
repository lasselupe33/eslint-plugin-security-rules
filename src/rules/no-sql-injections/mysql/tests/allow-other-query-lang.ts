import gql from "graphql-tag";

export default (apolloClient: any) =>
  apolloClient.query({
    query: gql`
      query getUser {
        user {
          id
          name
        }
      }
    `,
  });
