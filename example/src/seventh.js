const { ApolloServer, gql } = require('apollo-server')
const chalk = require('chalk')

const version = chalk.bold(chalk.bgBlue(' seventh '.toUpperCase()))
// The GraphQL schema
const typeDefs = gql`
  type Query {
    user(email: ID): User
  }
  type User {
    name: String
    email: String
  }
  type Mutation {
    """
    **signup** allows user to create an account
    """
    signup(name: String!, email: String!): User!
  }
`

const users = {
  '1': { name: 'Kevin Isom', email: 'kevin.isom@gmail.com', id: 1 },
  '2': { name: 'Other Kevin', email: 'kevin@kevinisom.info', id: 2 },
}

const getUser = id => users[id]

const resolvers = {
  Query: {
    user: (root, args, context, info) => {
      return getUser(args.email)
    },
  },

  Mutation: {
    signup: async (root, args, context, info) => {
      const { name, email } = args
      console.log('save user', { name, email })
      return { name, email }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    data: {},
  }),
})
server.listen().then(({ url }) => {
  console.log(`🚀 Server running the ${version} iteration is ready at ${url}`)
})
