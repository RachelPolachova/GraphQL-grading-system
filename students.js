let express = require('express');
let bodyParser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

const schema = gql`

  type Mutation {
    createStudent(
      id: ID!,
      name: String,
      address: String,
      class: String
      ): NewStudentResponse!,
      deleteStudent(id: ID!): DeleteStudentResponse!,
      updateStudent(
        id: ID!,
        name: String,
        address: String,
        class: String
      ): UpdateStudentResponse!,
  }

  type NewStudentResponse{
    success: Boolean!
  }

  type DeleteStudentResponse{
    success: Boolean!
  }

  type UpdateStudentResponse{
    success: Boolean!
  }

  type Query {
    student(id: ID): Student,
    students: [Student!]!
  }

  type Student {
    id: ID!,
    name: String,
    address: String,
    class: String
  }
`;

let students = [
  {
    id: 1,
    name: "Student number one",
    address: "Brno",
    class: "ARI"
  },
  {
    id: 2,
    name: "Second student",
    address: "London",
    class: "Deary"
  }
];


const resolvers = {
  Query: {
    student: (parent, args, context, info) => {
      return students.find(s => s.id == args.id)
    },
    students: (parent, args, context, info) => {
      return students
    }
  },

  Mutation: {
    createStudent: (parent, args, context, info) => {
      if (studentExists(args.id)) {
        return { success: false }
      } else {
        const newStudent = {
          id: args.id,
          name: args.name,
          address: args.address,
          class: args.class
        }
        students.push(newStudent)
        return { success: true }
      }
    },
    deleteStudent: (parent, args, context, info) => {
      let id = args.id;

      if (studentExists(id)) {
        let filtered = students.filter(function(student) {
          return student.id != args.id;
        });
        students = filtered;
        return { success: true }
      } else {
        return { success: false }
      }
    },
    updateStudent: (parent, args, context, info) => {
      let id = args.id;
      if (studentExists(id)) {
        let name = args.name;
        let address = args.address;
        let studentClass = args.class;
        let index = getIndex(id);
        if (name != null) {
          students[index].name = name;
        }
        if (address != null) {
          students[index].address = address;
        }
        if (studentClass != null) {
          students[index].class = studentClass;
        }
        return { success: true }
      } else {
        return { success: false }
      }
    }
  }
};

function studentExists(id) {
  console.log("studentExists called")
  for (i in students) {
    if (students[i].id == id) {
      return true;
    }
  }
  return false;
}

function getIndex(id) {
  for (i in students) {
    if (students[i].id == id) {
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