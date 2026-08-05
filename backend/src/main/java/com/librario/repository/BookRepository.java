package com.librario.repository;

import com.librario.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String title);

    @Query(value = "SELECT b.* FROM Books b LEFT JOIN Authors a ON a.AuthorId = b.AuthorId WHERE LOWER(a.AuthorName) LIKE LOWER(CONCAT('%', :author, '%'))", nativeQuery = true)
    List<Book> findByAuthorContainingIgnoreCase(@Param("author") String author);

    @Query(value = "SELECT b.* FROM Books b LEFT JOIN Categories c ON c.CategoryId = b.CategoryId WHERE LOWER(c.CategoryName) LIKE LOWER(CONCAT('%', :genre, '%'))", nativeQuery = true)
    List<Book> findByGenreContainingIgnoreCase(@Param("genre") String genre);

    @Query(value = "SELECT b.* FROM Books b LEFT JOIN Publishers p ON p.PublisherId = b.PublisherId WHERE LOWER(p.PublisherName) LIKE LOWER(CONCAT('%', :publisher, '%'))", nativeQuery = true)
    List<Book> findByPublisherContainingIgnoreCase(@Param("publisher") String publisher);
}
