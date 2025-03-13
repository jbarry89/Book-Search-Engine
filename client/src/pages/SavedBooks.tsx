
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import GET_ME from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
 
  const { loading, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  const userData = (data?.me as { 
    username: string; 
    savedBooks: { 
      bookId: string; 
      title: string; 
      authors: string[]; 
      description: string;
      image?: string 
    } [] 
  }) || { username: '', savedBooks: [] };

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
        update(cache) {
          const existingData: { me?: {savedBooks: {bookId: string}[] }} | null = cache.readQuery({ query: GET_ME });

          if (existingData?.me) {
            cache.writeQuery({
              query: GET_ME,
              data: {
                me: {
                  ...existingData.me,
                  savedBooks: existingData.me.savedBooks.filter(
                    (book) => book.bookId !== bookId
                  ),
                },
              },
            });
          }
        
        },
      });

      if(data?.removeBook){
        removeBookId(bookId);
      }

    } catch (err) {
      console.error('Error Deleting Book:',err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
              <Col key={book.bookId} md='4'>
                <Card border='dark'>
                  {book.image && (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ') || 'Unknown'}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            
            ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
