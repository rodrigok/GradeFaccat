import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const host = 'localhost';

const httpLink = new HttpLink({
	uri: `http://${ host }:3000/graphql`,
});

const authLink = new ApolloLink((operation, forward) => {
	operation.setContext(() => {
		const token = localStorage.getItem('Meteor.loginToken');

		return {
			headers: {
				Authorization: `Bearer ${ token || '' }`,
			},
		};
	});

	return forward(operation);
});

const wsLink = new WebSocketLink({
	uri: `ws://${ host }:5000/subscriptions`,
	options: {
		reconnect: true,
		lazy: true,
		connectionParams: () => {
			const token = localStorage.getItem('Meteor.loginToken');
			return {
				authToken: token,
			};
		},
	},
});

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query);
		return kind === 'OperationDefinition' && operation === 'subscription';
	},
	wsLink,
	httpLink,
);

export const client = new ApolloClient({
	link: concat(authLink, link),
	cache: new InMemoryCache(),
});
