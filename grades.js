let express = require('express');
let bodyParser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();

const schema = gql`

  type Mutation {
    createGrade(
      courseId: ID!,
      students: [CreateStudentInput],
      # studentId: ID,
      # studentGrade: Int,
      ): NewGradeResponse!,
      deleteCourseGrade(courseId: ID!): DeleteCourseGradeResponse!,
      deleteStudentFromCourseGrade(courseId: ID, studentId: ID): DeleteStudentResponse!,
      updateGrade(
        courseId: ID!,
        studentId: ID,
        studentGrade: Int,
      ): UpdateGradeResponse!,
  }

  type Student {
    studentId: ID!,
    grade: Int
  }

  input CreateStudentInput {
    studentId: ID!,
    grade: Int
  }

  type NewGradeResponse{
    success: Boolean!
  }

  type DeleteCourseGradeResponse{
    success: Boolean!
  }

  type DeleteStudentResponse{
      success: Boolean!
  }

  type UpdateGradeResponse{
    success: Boolean!
  }

  type Query {
    grade(courseId: ID): Grade,
    grades: [Grade!]!
  }

  type Grade {
    courseId: ID!,
    students: [Student]
  }
`;

let grades = [
    {
		courseId: 1,
		students: [
			{
				studentId: 1,
				grade: 1
			},
			{
				studentId: 2,
				grade: 1
			}
		]
	},
	{
		courseId: 2,
		students: [
			{
				studentId: 1,
				grade: 3
			},
			{
				studentId: 9,
				grade: 5
			}
		]
	}
];


const resolvers = {
  Query: {
    grade: (parent, args, context, info) => {
      return grades.find(s => s.courseId == args.courseId)
    },
    grades: (parent, args, context, info) => {
      return grades
    }
  },

  Mutation: {
    createGrade: (parent, args, context, info) => {
      let courseId = args.courseId
      if (courseExists(courseId)) {
          //course already exists, cannot duplicate
          return { success: false }
      } else {
        const newGrade = {          
          courseId: courseId,
          students: args.students
        }
        grades.push(newGrade)
        return { success: true } 
      }
    },
    // delete whole course from grading system
    deleteCourseGrade: (parent, args, context, info) => {
      let id = args.courseId;

      if (courseExists(id)) {
        let filtered = grades.filter(function(grade) {
          return grade.courseId != id;
        });
        grades = filtered;
        return { success: true }
      } else {
        return { success: false }
      }
    },
    // delete current student from course in grading system
    deleteStudentFromCourseGrade: (parent, args, context, info) => {
        let courseId = args.courseId;
        let studentId = args.studentId;
        if (courseExists(courseId)) {
          if (studentExistsInCourse(courseId, studentId)) {
            let courseIndex = getCoursesIndex(courseId)

            let filtered = grades[courseIndex].students.filter(function(student) {
                return student.studentId != studentId;
            })
            grades[courseIndex].students = filtered
            return { success: true }
          } else {
            // student doesn't exist in this course
            return { success: false }
          }
        } else {
          // this course doesn't exist
          return { success: false }
        }
    },
    updateGrade: (parent, args, context, info) => {

      let courseId = args.courseId;
      let studentId = args.studentId
      if (courseExists(courseId)) {
        if (studentExistsInCourse(courseId, studentId)) {
          let courseIndex = getCoursesIndex(courseId);
          let studentIndex = getStudentsIndex(courseId, studentId);
          grades[courseIndex].students[studentIndex].grade = args.studentGrade;
          return { success: true }
        } else {
          // no student to update
          return { success: false }
        }
      } else {
        // course doesn't exist
        return { success: false }
      }

      // let id = args.id;
      // if (courseExists(id)) {
      //   let name = args.name;
      //   let adress = args.adress;
      //   let description = args.description;
      //   let index = getCoursesIndex(id);
      //   if (name != null) {
      //     courses[index].name = name;
      //   }
      //   if (adress != null) {
      //     courses[index].adress = adress;
      //   }
      //   if (description != null) {
      //     courses[index].description = description;
      //   }
      //   return { success: true }
      // } else {
      //   return { success: false }
      // }
    }
  }
};

// returns true if course exists in grading system
function courseExists(id) {
  for (i in grades) {
    if (grades[i].courseId == id) {
      return true;
    }
  }
  return false;
}

function studentExistsInCourse(courseId, studentId) {
  let courseIndex = getCoursesIndex(courseId)
  for (i in grades[courseIndex].students) {
    if (grades[courseIndex].students[i].studentId == studentId) {
      return true;
    }
  }
  return false 
}

function getCoursesIndex(id) {
  for (i in grades) {
    if (grades[i].courseId == id) {
  return i;
    }
  }
}

function getStudentsIndex(courseId, studentId) {
  let courseIndex = getCoursesIndex(courseId)
  for (i in grades[courseIndex].students) {
    if (grades[courseIndex].students[i].studentId == studentId) {
      return i
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