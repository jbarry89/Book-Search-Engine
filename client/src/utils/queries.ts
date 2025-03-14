import { gql } from "@apollo/client";

const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        title
        description
        image
        link
      }
    }
  }
`;

export default GET_ME;
