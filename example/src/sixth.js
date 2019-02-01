const { ApolloServer, gql } = require('apollo-server')
const DataLoader = require('dataloader')
const chalk = require('chalk')

const version = chalk.bold(chalk.bgBlue(' sixth '.toUpperCase()))
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
const getUser = id => users[id]
const getProjectById = id => projects.filter(p => p.id === id)[0]

const getProjectByName = name => projects.filter(p => p.name === name)[0]
const getProjectsByUserId = userId => {
  console.log('getProjectsByUserId called')
  const projectIds = contributors.reduce((ids, project) => {
    if (project.users.includes(userId)) {
      ids.push(project.project)
    }
    return ids
  }, [])

  return projects.filter(p => projectIds.includes(p.id))
}

const getUsersByProject = projectId => {
  console.log('getUsersByProject called')
  return contributors.filter(p => p.project === projectId)[0].users.map(getUser)
}
const userLoader = new DataLoader(keys => {
  return keys.map(getUser)
})
const projectLoader = new DataLoader(keys => {
  return keys.map(getProjectById)
})

const usersOfProjectLoader = new DataLoader(keys => {
  console.log('DATALOADER:: usersOfProjectLoader')
  return Promise.resolve(keys.map(getUsersByProject))
})
const projectsByUserLoader = new DataLoader(keys => {
  console.log('DATALOADER:: projectsByUserLoader')
  return Promise.resolve(keys.map(getProjectsByUserId))
})
const resolvers = {
  Query: {
    project: (root, args, context, info) => {
      return context.data.getProjectByName(args.name)
    },
  },
  User: {
    projects: async (root, args, context, info) => {
      return context.data.getProjectsByUser.load(root.id)
    },
  },

  Project: {
    contributors: async (root, args, context, info) => {
      return context.data.getContributorsToProject.load(root.id)
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
      getUser,
      getProjectById,
      getProjectByName,
      getProjectsByUserId,
      getUsersByProject,
      getUserFromLoader: userLoader,
      getProjectFromLoader: projectLoader,
      getContributorsToProject: usersOfProjectLoader,
      getProjectsByUser: projectsByUserLoader,
    },
  }),
})
server.listen().then(({ url }) => {
  console.log(`🚀 Server running the ${version} iteration is ready at ${url}`)
})
