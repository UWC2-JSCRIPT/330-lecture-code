const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const Books = require('../models/book');
const bookAPI = require('../apis/bookAPI');

describe("/books", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  describe('POST /books', () => {
    const minimalBook = {
      "author":"Joel",
      "title": "book",
      "pageCount": 7,
      "publicationYear": 1994,
    };
    const completeBook = {
      ...minimalBook,
      genre: 'Fiction',
      blurb: 'Really good stuff'
    };
    it ('should store a book with minimal fields', async () => {
      const response = await request(server).post('/books').send(minimalBook);
      expect(response.statusCode).toEqual(200);
      const savedBooks = await Books.find().lean();
      expect(savedBooks.length).toEqual(1);
      expect(savedBooks[0]).toMatchObject(minimalBook)
    })
    it ('should store a book with complete fields', async () => {
      const response = await request(server).post('/books').send(completeBook);
      expect(response.statusCode).toEqual(200);      
      const savedBooks = await Books.find().lean();
      expect(savedBooks.length).toEqual(1);
      expect(savedBooks[0]).toMatchObject(completeBook)
    })
    it ('should not store an empty book', async () => {
      const response = await request(server).post('/books').send({});
      expect(response.statusCode).toEqual(400);
      const savedBooks = await Books.find().lean();
      expect(savedBooks.length).toEqual(0);
    })
    it.each(Object.keys(minimalBook))('should return 400 if %s is not provided', async(key) => {
      const bookWithKeyMissing = {
        ...minimalBook,
        [key]: undefined
      }
      const response = await request(server).post('/books').send(bookWithKeyMissing);
      expect(response.statusCode).toEqual(400);
      const savedBooks = await Books.find().lean();
      expect(savedBooks.length).toEqual(0);
    })

    describe('uniqueness testing', () => {
      const existingBook = {
        "author":"Test",
        "title": "Book 1",
        "pageCount": 100,
        "publicationYear": 2008,
      };
      beforeEach(async () => {
        await Books.create(existingBook)
      });
      it ('should reject duplicate author/title combinations', async () => {
        const response = await request(server).post('/books').send(existingBook);
        expect(response.statusCode).toEqual(409);
        const savedBooks = await Books.find().lean();
        expect(savedBooks.length).toEqual(1);
      })
      it.each(['title', 'author'])('should not reject book when %s is not duplicated', async (key) => {
        const newBook = {
          ...existingBook,
          [key]: 'other',
        }
        const response = await request(server).post('/books').send(newBook);
        expect(response.statusCode).toEqual(200);
        const savedBooks = await Books.find().lean();
        expect(savedBooks.length).toEqual(2);
        expect(savedBooks).toMatchObject([existingBook, newBook]);
      })
    })
  })

  describe('GET /:id/ISBN', () => {
    let savedBook;
    let getISBNMock;
    const ISBN = 'test ISBN';
    beforeEach(async () => {
      savedBook = await Books.create({
        "author":"Test",
        "title": "Book 1",
        "pageCount": 100,
        "publicationYear": 2008,
      })
      getISBNMock = jest.spyOn(bookAPI, 'getISBN');
      getISBNMock.mockResolvedValue(ISBN)
    });
    afterEach(() => {
      getISBNMock.mockRestore();
    })
    it ('should return the ISBN from external API', async () => {
      const response = await request(server).get(`/books/${savedBook._id.toString()}/ISBN`).send();
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ ISBN });
      expect(getISBNMock).toHaveBeenCalledTimes(1);
      expect(getISBNMock).toHaveBeenCalledWith(savedBook.title, savedBook.author);
    });
    it ('should send a 500 if the external API returns an error', async () => {
      getISBNMock.mockRejectedValue(new Error('Some error'));
      const response = await request(server).get(`/books/${savedBook._id.toString()}/ISBN`).send();
      expect(response.statusCode).toEqual(500);
      expect(getISBNMock).toHaveBeenCalledTimes(1);
      expect(getISBNMock).toHaveBeenCalledWith(savedBook.title, savedBook.author);
    });
  })
});