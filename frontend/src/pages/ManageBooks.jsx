import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function ManageBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/books")
      .then((res) => {
        setBooks(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📚 Book Catalog</h2>

      {books.length === 0 ? (
        <p className="text-center">No books available.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Copies</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.year}</td>
                <td>
                  {book.availableCopies} / {book.totalCopies}
                </td>
                <td>{book.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageBooks;
