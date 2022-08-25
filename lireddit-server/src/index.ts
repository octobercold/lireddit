import { MikroORM } from "@mikro-orm/core";
//import { Post } from "./entities/post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    //forked to avoid working on global database
    //const emFork = orm.em.fork();

    await orm.getMigrator().up();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false,
        }),
    });

    const app = express();

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("server started on localhost: 4000");
    });
};

main().catch((err) => {
    console.log(err);
});
