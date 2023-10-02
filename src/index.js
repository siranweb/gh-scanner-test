import 'dotenv/config';

import { githubResolver } from "./modules/github/index.js";
import { GraphqlServer } from "./infra/graphql-server.js";

const server = new GraphqlServer();
server.addToQuery(githubResolver.Query);
server.addTypeDefs(githubResolver.typeDefs);
server.start(8080);