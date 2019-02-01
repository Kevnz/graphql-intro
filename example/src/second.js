const { ApolloServer, gql } = require('apollo-server')
const chalk = require('chalk')

const version = chalk.bold(chalk.yellow('second'.toUpperCase()))
// The GraphQL schema
const typeDefs = gql`
  type Query {
    project(name: ID): Project
  }
  type User {
    name: String
    email: String
    projects: [Project]
  }
  type Project {
    name: String
    tagline: String
    contributors: [User]
  }
`

const projects = [
  {
    name: 'GraphQL',
    tagline: 'A query language for your API',
  },
  {
    name: 'REST',
    tagline: 'Out of touch and out of date',
  },
]

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    project: () => projects[0],
  },
  Project: {
    contributors: async (root, args, context, info) => {
      console.info('root', root)
      console.info('args', args)
      console.info('context', context)
      console.info('info', info)
      return [{ name: 'Kevin', email: 'kevin.isom@gmail.com' }]
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})
server.listen().then(({ url }) => {
  console.log(`🚀 Server running the ${version} iteration is ready at ${url}`)
})
