let express = require('express');
let bodyParser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

const schema = gql`

  type Mutation {
    createCourse(
      id: ID!,
      name: String,
      description: String
      ): NewCourseResponse!,
      deleteCourse(id: ID!): DeleteCourseResponse!,
      updateCourse(
        id: ID!,
        name: String,
        description: String
      ): UpdateCourseResponse!,
  }

  type NewCourseResponse{
    success: Boolean!
  }

  type DeleteCourseResponse{
    success: Boolean!
  }

  type UpdateCourseResponse{
    success: Boolean!
  }

  type Query {
    course(id: ID): Course,
    courses: [Course!]!
  }

  type Course {
    id: ID!,
    name: String,
    description: String,
  }
`;

let courses = [
    {
        id: 1,
        name: "1st course",
        description: "random description",
		},
    {
        id: 2,
		name: "second course",
		description: "another random description",
    }
];


const resolvers = {
  Query: {
    course: (parent, args, context, info) => {
      return courses.find(s => s.id == args.id)
    },
    courses: (parent, args, context, info) => {
      return courses
    }
  },

  Mutation: {
    createCourse: (parent, args, context, info) => {
      if (courseExists(args.id)) {
          return { success: false }
      } else {
        const newCourse = {
            id: args.id,
            name: args.name,
            description: args.description
          }
          courses.push(newCourse)
          return { success: true }
      }
    },
    deleteCourse: (parent, args, context, info) => {
      let id = args.id;

      if (courseExists(id)) {
        let filtered = courses.filter(function(course) {
          return course.id != id;
        });
        courses = filtered;
        return { success: true }
      } else {
        return { success: false }
      }
    },
    updateCourse: (parent, args, context, info) => {
      let id = args.id;
      if (courseExists(id)) {
        let name = args.name;
        let adress = args.adress;
        let description = args.description;
        let index = getIndex(id);
        if (name != null) {
          courses[index].name = name;
        }
        if (adress != null) {
          courses[index].adress = adress;
        }
        if (description != null) {
          courses[index].description = description;
        }
        return { success: true }
      } else {
        return { success: false }
      }
    }
  }
};

function courseExists(id) {
  for (i in courses) {
    if (courses[i].id == id) {
      return true;
    }
  }
  return false;
}

function getIndex(id) {
  for (i in courses) {
    if (courses[i].id == id) {
  return i;
    }
}
}

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});