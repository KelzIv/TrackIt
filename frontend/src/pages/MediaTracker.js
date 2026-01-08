import { useState, useEffect } from "react";
import {
  getMedia,
  addMedia,
  editMedia,
  deleteMedia,
  logoutUser
} from "../services/api";
import "./mediaTracker.css";

export default function MediaTracker({ token, setToken }) {
  const [mediaList, setMediaList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    media_type: "Movie",
    status: "To Watch",
    rating: 0,
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);

  // Fetch media when token changes
  useEffect(() => {
    const fetchMedia = async () => {
      if (!token) return;
      try {
        const data = await getMedia(token);
        setMediaList(data);
      } catch (err) {
        console.error("Failed to fetch media:", err);
        if (err.response?.status === 401) {
          // Token invalid, auto-logout
          handleLogout();
        }
      }
    };
    fetchMedia();
  }, [token]);

  // Clear messages automatically
  useEffect(() => {
    if (message && messageTimeout) {
      clearTimeout(messageTimeout);
    }
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      setMessageTimeout(timeout);
    }
    return () => clearTimeout(messageTimeout);
  }, [message, messageTimeout]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await editMedia(editingId, form, token);
        setMediaList(
          mediaList.map((item) =>
            item.id === editingId ? updated : item
          )
        );
        setMessage("Media updated successfully!");
        setEditingId(null);
      } else {
        const newItem = await addMedia(form, token);
        setMediaList([...mediaList, newItem]);
        setMessage("Media added successfully!");
      }
      // Reset form
      setForm({
        title: "",
        media_type: "Movie",
        status: "To Watch",
        rating: 0,
        notes: "",
      });
    } catch (err) {
      console.error("Media operation failed:", err);
      setMessage(err.response?.data?.error || "Operation failed.");
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      media_type: item.media_type,
      status: item.status,
      rating: item.rating || 0,
      notes: item.notes || "",
    });
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteMedia(id, token);
      setMediaList(mediaList.filter((item) => item.id !== id));
      setMessage("Media deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("Delete failed.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // Optional backend call
    } catch (err) {
      console.error("Logout API failed (normal for JWT):", err);
    } finally {
      // Critical: Clear token from both localStorage and parent state
      localStorage.removeItem("token");
      setToken(""); // This tells App.js to show Auth component
    }
  };

  if (!token) {
    return <div>Loading...</div>; // Prevent flash during logout
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MediaTracker</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="content">
        <div className="card">
          <h2>{editingId ? "Edit Media" : "Add New Media"}</h2>

          <form onSubmit={handleAddOrEdit} className="media-form">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <select
              name="media_type"
              value={form.media_type}
              onChange={handleChange}
            >
              <option value="Movie">Movie</option>
              <option value="TV Show">TV Show</option>
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="To Watch">To Watch</option>
              <option value="Watching">Watching</option>
              <option value="Watched">Watched</option>
            </select>

            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={form.rating}
              onChange={handleChange}
              placeholder="Rating (0-5)"
            />

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
            />

            <button type="submit" className="primary-btn">
              {editingId ? "Update Media" : "Add Media"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    media_type: "Movie",
                    status: "To Watch",
                    rating: 0,
                    notes: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </form>

          {message && (
            <p className={`message ${message.includes("success") ? "success" : "error"}`}>
              {message}
            </p>
          )}
        </div>

        <div className="media-list">
          {mediaList.length === 0 ? (
            <p className="empty-state">No media tracked yet. Add some above!</p>
          ) : (
            mediaList.map((item) => (
              <div className="media-card" key={item.id}>
                <h3>{item.title}</h3>
                <p className="media-meta">
                  <span className="media-type">{item.media_type}</span> • 
                  <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </p>
                {item.rating > 0 && (
                  <p className="rating">⭐ {item.rating}/5</p>
                )}
                {item.notes && <p className="notes">{item.notes}</p>}

                <div className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
