const { ApolloServer, gql } = require('apollo-server')
const chalk = require('chalk')

const version = chalk.bold(chalk.magenta('third'.toUpperCase()))

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
    id: 1,
    name: 'GraphQL',
    tagline: 'A query language for your API',
  },
  {
    id: 2,
    name: 'REST',
    tagline: 'Out of touch and out of date',
  },
]
const contributors = [
  {
    project: 1,
    users: [{ name: 'Kevin Isom', email: 'kevin.isom@gmail.com' }],
  },
  {
    project: 2,
    users: [
      { name: 'Kevin', email: 'kevin.isom@gmail.com' },
      { name: 'Other Kevin', email: 'kevin@kevinisom.info' },
    ],
  },
]

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    project: (root, args, context, info) => {
      console.info('root', root)
      console.info('args', args)
      console.info('context', context)
      return context.data.projects.filter(p => p.name === args.name)[0]
    },
  },
  Project: {
    contributors: async (root, args, context, info) => {
      console.info('context', context)
      console.log('root', root)
      const projectId = root.id
      return context.data.contributors.filter(p => p.project === projectId)[0]
        .users
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    data: {
      projects,
      contributors,
    },
  }),
})
server.listen().then(({ url }) => {
  console.log(`🚀 Server running the ${version} iteration is ready at ${url}`)
})
