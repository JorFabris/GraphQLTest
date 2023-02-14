import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
import { v1 as uuid } from "uuid";

const people = [
  {
    name: "Jorge",
    street: "False 123",
    id: "31c876fc-9650-4b78-a439-59835b9b5c64",
    phone: "342-4388-3989",
    city: "Vera",
  },
  {
    name: "Pepe",
    street: "True 123",
    id: "c473c86d-6c8e-4131-b399-9727f763a7a5",
    phone: "342-6567-4565",
    city: "Barcelona",
  },
  {
    name: "Andres",
    street: "Null 123",
    id: "cba21914-b300-4726-9a82-836af67665b5",
    phone: "342-7896-2345",
    city: "Madrid",
  },
];

const typeDefinitions = `#graphql
    type Address {
        city: String!
        street: String!
    }

  type Person {
    name: String!
    phone: String!
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPeople: [Person]!
    findPerson(name: String!): Person!
  }

  type Mutation {
    addPerson(
        name: String!
        phone: String!
        street: String!
        city: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => people.length,
    allPeople: () => people,
    findPerson: (root, { name }) =>
      people.find((fPerson) => fPerson.name === name),
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (people.find((fPerson) => fPerson.name === args.name)) {
        throw new GraphQLError("Person name must be unique", {
          extensions: { code: "INVALID_ARGS" },
        });
      }
      const person = { ...args, id: uuid() };
      people.push(person); //Update database
      return person;
    },
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`SERVER RUNNING IN: ${url}`);
});
