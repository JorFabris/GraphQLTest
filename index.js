import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";
import { GraphQLError } from "graphql";
import { v1 as uuid } from "uuid";

const typeDefinitions = `#graphql
    enum YesNo {
        YES,
        NO
    }

    type Address {
        city: String!
        street: String!
    }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPeople(phone: YesNo): [Person]!
    findPerson(name: String!): Person!
  }

  type Mutation {
    addPerson(
        name: String!
        phone: String
        street: String!
        city: String!
    ): Person
    editPhone(
        id: String!
        phone: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => people.length,
    allPeople: async (root, args) => {
      const { data: people } = await axios.get("http://localhost:3000/persons");
      if (!args.phone) return people;

      const filterByPhone = (person) => (person.phone ? person : null);
      const filterByNoPhone = (person) => (!person.phone ? person : null);

      return args.phone === "YES"
        ? people.filter(filterByPhone)
        : people.filter(filterByNoPhone);
    },
    findPerson: (root, args) =>
      people.find((fPerson) => fPerson.name === args.name),
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
    editPhone: (root, args) => {
      const personIndex = people.findIndex((person) => person.id === args.id);

      if (personIndex === -1) return null;

      const person = people[personIndex];
      const updatedPerson = { ...person, phone: args.phone };
      people[personIndex] = updatedPerson;
      return updatedPerson;
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
