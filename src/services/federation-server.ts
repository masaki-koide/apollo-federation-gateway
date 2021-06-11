import { ServerInfo } from 'apollo-server'

import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'

const typeDefs = gql`
  extend type Query {
    topProducts(first: Int = 5): [Product]
  }
  type Product @key(fields: "upc") {
    upc: String!
    name: String
    price: Int
    weight: Int
    reviews: [Review]
  }
  extend type Review @key(fields: "id") {
    id: ID! @external
  }
`;

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100,
    reviews: [{
      id: "1"
    }, {
      id: "2"
    }]
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000,
    reviews: [{
      id: "3"
    }]
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50,
    reviews: [{
      id: "4"
    }]
  }
];

const resolvers = {
  Product: {
    __resolveReference(reference: any) {
      return products.find(product => product.upc === reference.upc);
    },
  },
  Query: {
    topProducts(_: any, args: any) {
      return products.slice(0, args.first);
    }
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
})

server.listen({ port: 4002 }).then(({ url }: ServerInfo) => {
  console.log(`🚀 Federation server ready at ${url}`)
})
