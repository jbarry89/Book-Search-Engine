import './App.css';
import { Outlet } from 'react-router-dom';
import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';

import Navbar from './components/Navbar';

// Create Apollo Client instance
const client = new ApolloClient({
  uri: '/graphql', // Ensure this matches your backend GraphQL endpoint
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;