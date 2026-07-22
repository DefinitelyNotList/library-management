import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookList() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const getToken = () => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return null;

    const cleaned = rawToken.trim().replace(/\s/g, "");
    if (cleaned.split(".").length !== 3) return null; // JWT format check
    return cleaned;
  };

  useEffect(() => {
    fetchBooks();
  }, [location]);

  const fetchBooks = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No valid token");
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:8080/api/books", {
        headers: {
          Authorization: token,
        },
      });

      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchBooks();
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/api/books/search/title?title=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBooks(response.data);
    } catch (error) {
      console.error("Search failed", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        await axios.delete(`http://localhost:8080/api/books/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    }
  };

  const handleEdit = (book) => {
    navigate("/edit-book", { state: { book } });
  };

  return (
    <div className="container mt-4">
      <h2>📚 Book Catalog</h2>

      <div className="d-flex mb-3">
        <input
          type="text"
          placeholder="Search by title"
          value={query}
          className="form-control me-2"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Copies</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>
                  {book.availableCopies} / {book.totalCopies}
                </td>
                <td>{book.year}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookList;
