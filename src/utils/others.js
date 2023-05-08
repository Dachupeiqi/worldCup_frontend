
import moment from 'moment/moment';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

export  function converTime(t){
    return moment(t*1000).format("YYYY/MM/DD")
  }



  const graphUrl = "https://api.studio.thegraph.com/query/46165/worldcup/0.0.11"
  export async function executeQuery(query, variables) {
    
    const client = new ApolloClient({
      uri: graphUrl,
      cache: new InMemoryCache(),
    });
  
    const res = await client
      .query({
        query: gql(query),
        variables: {
          variables
        },
      })
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
    return res
  }