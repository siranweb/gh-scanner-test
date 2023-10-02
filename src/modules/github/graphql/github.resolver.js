import graphqlFields from 'graphql-fields';

export class GithubResolver {
    typeDefs = `#graphql
    type Repository {
        name: String!
        owner: String!
        size: Int!
    }

    type RepositoryDetails {
        name: String!
        size: Int!
        owner: String!
        private: Boolean!
        totalFiles: Int!
        ymlContent: String
        activeWebhooks: [String]
    }

    type Query {
        repositories: [Repository]!
        repositoryDetails(owner: String!, repo: String!): RepositoryDetails!
    }
    `;

    Query = {};

    constructor({ getRepositoriesListAction, getRepositoryDetailsAction }) {
        this.getRepositoriesListAction = getRepositoriesListAction;
        this.getRepositoryDetailsAction = getRepositoryDetailsAction;

        this.Query.repositories = this.#getRepositories.bind(this);
        this.Query.repositoryDetails = this.#getRepositoryDetails.bind(this);
    }

    async #getRepositories() {
        return this.getRepositoriesListAction.exec();
    }

    async #getRepositoryDetails(parent, args, contextValue, info) {
        const selectedFields = graphqlFields(info);
        const withScan = !!(selectedFields.totalFiles || selectedFields.ymlContent);
        return this.getRepositoryDetailsAction.exec(args.owner, args.repo, {
            scan: withScan
        });
    }
}