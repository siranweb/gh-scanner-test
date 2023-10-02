import {ApolloServer} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";

export class GraphqlServer {
    #resolvers = {
        Query: {},
    }
    #typeDefs = [];

    async start(port) {
        const server = new ApolloServer({
            typeDefs: this.#typeDefs,
            resolvers: this.#resolvers,
        });

        const { url } = await startStandaloneServer(server, {
            listen: {
                port,
            }
        });

        console.log(`Server ready at: ${url}`)
    }

    addToQuery(query) {
        this.#resolvers.Query = {
            ...this.#resolvers.Query,
            ...query,
        }
    }

    addTypeDefs(typeDefs) {
        this.#typeDefs.push(typeDefs);
    }
}