import { delegateToSchema, makeExecutableSchema } from 'graphql-tools'
import { ApolloServer } from 'apollo-server'
import { transformSchemaFederation } from 'graphql-transform-federation'

const reviews = [
  {
    id: "1",
    body: "Love it!",
    product: { upc: "1" }
  },
  {
    id: "2",
    body: "Too expensive.",
    product: { upc: "2" }
  },
  {
    id: "3",
    body: "Could be better.",
    product: { upc: "3" }
  },
  {
    id: "4",
    body: "Prefer something else.",
    product: { upc: "1" }
  }
];

const schemaWithoutFederation = makeExecutableSchema({
  typeDefs: `
    type Review {
      id: ID!
      body: String
      product: Product
    }
  
    type Product {
      upc: String!
    }
    
    type Query {
      reviews(ids: [ID!]!): [Review]
    }
  `,
  resolvers: {
    Query: {
      reviews(_: any, args: any) {
        return reviews.filter(review => args.ids.includes(review.id))
      }
    }
  },
})

const federationSchema = transformSchemaFederation(schemaWithoutFederation, {
  Query: {
    extend: true,
  },
  Review: {
    keyFields: ["id"],
    resolveReference(reference, context: { [key: string]: any }, info) {
      return reviews.find(review => review.id === (reference as any).id)
    },
  },
  Product: {
    extend: true,
    keyFields: ['upc'],
    fields: {
      upc: {
        external: true,
      },
    },
  },
})

new ApolloServer({
  schema: federationSchema,
})
  .listen({
    port: 4001,
  })
  .then(({ url }) => {
    console.log(`🚀 Transformed server ready at ${url}`)
  })
