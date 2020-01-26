const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const data = require("./data");

const schema = buildSchema(`
type item {
  id: Int
  name: String
  quantity: Int
  category: String
  ingredient: [String]
  expiry: String
}

input ItemInput {
  id: Int
  name: String
  quantity: Int
  category: String
  ingredient: [String]
  expiry: String
}
input QuantityInput {
  id: Int
  name: String
  quantity: Int
}
type Query {
  Items: [item]
  SearchByCategory(category: String): [item] 
  ExpireInDay(day: Int): [item]
}
type Mutation {
  AddItem(input: ItemInput): [item]
  DeleteItem(id: Int, name: String): [item]
  AddQuantity(id: Int, name: String, quantity: Int): [item]
  ReduceQuantity(id: Int, name: String, quantity: Int): [item]
}
`);

const root = {
  Items: () => {
    return data.items;
  },
  SearchByCategory: (request)  => {
    return data.items.filter((item) => item.category === request.category);
  },
  ExpireInDay: (request)  => {
    return data.items.filter((item) => {
      let date1 = new Date(item.expiry);
      let date2 = new Date();
      return ((date1.getTime() - date2.getTime())/ (1000 * 3600 * 24)) <= request.day;
      })
  },
  AddItem: (request) => {
    let newId = data.items.length + 1;
    request.input.id = newId;
    data.items.push(request.input);
    return data.items;
  },
  DeleteItem: (request) => {
    let index;
    if (!request.id) {
      index = data.items.findIndex((item) => item.name.toLowerCase() === request.name.toLowerCase()
      );
    } else {
      index = data.items.findIndex((item) => item.id === request.id);
    }
    if (index !== -1) data.items.splice(index, 1);
    return data.items;
  },
  AddQuantity: (request) => {
    let index;
    if (!request.id) {
      index = data.items.findIndex((item) => item.name.toLowerCase() === request.name.toLowerCase()
    );
    } else {
      index = data.items.findIndex((item) => item.id === request.id);
    }
    data.items[index].quantity += request.quantity;
    return data.items;
   },
  ReduceQuantity: (request) => {
    let index;
    if (!request.id) {
      index = data.items.findIndex((item) => item.name.toLowerCase() === request.name.toLowerCase()
    );
    } else {
      index = data.items.findIndex((item) => item.id === request.id);
    }
    if(data.items[index].quantity > request.quantity) {
      data.items[index].quantity -= request.quantity
    } else {
      data.items.splice(index, 1);
      }
    return data.items;
   },
}

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});