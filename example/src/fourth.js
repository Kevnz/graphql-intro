const { ApolloServer, gql } = require('apollo-server')
const chalk = require('chalk')

const version = chalk.bold(chalk.cyan('fourth'.toUpperCase()))
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
const users = {
  '1': { name: 'Kevin Isom', email: 'kevin.isom@gmail.com', id: 1 },
  '2': { name: 'Other Kevin', email: 'kevin@kevinisom.info', id: 2 },
}
const contributors = [
  {
    project: 1,
    users: [1],
  },
  {
    project: 2,
    users: [1, 2],
  },
]

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    project: (root, args, context, info) => {
      return context.data.projects.filter(p => p.name === args.name)[0]
    },
  },
  User: {
    projects: async (root, args, context, info) => {
      const projIds = context.data.contributors.reduce((projcs, proj) => {
        if (proj.users.includes(root.id)) {
          projcs.push(proj.project)
        }
        return projcs
      }, [])

      return context.data.projects.filter(p => projIds.includes(p.id))
    },
  },

  Project: {
    contributors: async (root, args, context, info) => {
      const projectId = root.id
      const users = context.data.contributors.filter(
        p => p.project === projectId
      )[0].users

      return users.map(u => context.data.users[u])
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
      users,
    },
  }),
})
server.listen().then(({ url }) => {
  console.log(`🚀 Server running the ${version} iteration is ready at ${url}`)
})
