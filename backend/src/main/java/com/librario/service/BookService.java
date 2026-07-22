package com.librario.service;

import com.librario.model.Book;

import java.util.List;

public interface BookService {
    List<Book> getAllBooks();

    Book addBook(Book book);

    Book updateBook(Long id, Book book);

    void deleteBook(Long id);

    Book getBookById(Long id);

    List<Book> searchByTitle(String title);
    List<Book> searchByAuthor(String author);
    List<Book> searchByGenre(String genre);
    List<Book> searchByPublisher(String publisher);


}
