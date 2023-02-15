import { ApolloServer } from "@apollo/server";

import { startStandaloneServer } from "@apollo/server/standalone";

import "./db.connection.js";
import personModel from "./models/person.model.js";

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
    personCount: async () => await personModel.collection.countDocuments(),
    allPeople: async (root, args) => {
      if (!args.phone) return await personModel.find();

      return personModel.find({
        phone: { $exists: args.phone === "YES" },
      });
    },
    findPerson: async (root, args) => {
      return await personModel.findOne({ name: args.name });
    },
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
    addPerson: async (root, args) => {
      const person = new personModel({ ...args });
      await person.save();
      return person;
    },
    editPhone: async (root, args) => {
      const person = await personModel.findById(args.id);
      person.phone = args.phone;
      return await person.save();
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
