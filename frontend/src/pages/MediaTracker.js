import { useState, useEffect } from "react";
import { getMedia, addMedia, editMedia, deleteMedia, logoutUser} from "../services/api";
import "./mediaTracker.css";

export default function MediaTracker({ token }) {
  const [mediaList, setMediaList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    media_type: "Movie",
    status: "To Watch",
    rating: 0,
    notes: "",
  });
  const [editingId, setEditingId] = useState(null); // track currently editing item
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await getMedia(token);
        setMediaList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedia();
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await editMedia(editingId, form, token);
        setMediaList(mediaList.map((item) => (item.id === editingId ? updated : item)));
        setMessage("Media updated!");
        setEditingId(null);
      } else {
        const newItem = await addMedia(form, token);
        setMediaList([...mediaList, newItem]);
        setMessage("Media added!");
      }
      setForm({ title: "", media_type: "Movie", status: "To Watch", rating: 0, notes: "" });
    } catch (err) {
      setMessage("Operation failed.");
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      media_type: item.media_type,
      status: item.status,
      rating: item.rating,
      notes: item.notes,
    });
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteMedia(id, token);
      setMediaList(mediaList.filter((item) => item.id !== id));
      setMessage("Media deleted!");
    } catch (err) {
      setMessage("Delete failed.");
    }
  };

  const handleLogout = async () => {
  try {
    await logoutUser();
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};

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
        <h2>{editingId ? "Edit Media" : "Add Media"}</h2>

        <form onSubmit={handleAddOrEdit} className="media-form">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <select name="media_type" value={form.media_type} onChange={handleChange}>
            <option>Movie</option>
            <option>TV Show</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange}>
            <option>To Watch</option>
            <option>Watching</option>
            <option>Watched</option>
          </select>

          <input
            name="rating"
            type="number"
            min="0"
            max="5"
            value={form.rating}
            onChange={handleChange}
            placeholder="Rating (0–5)"
          />

          <input
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn">
            {editingId ? "Update Media" : "Add Media"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      <div className="media-list">
        {mediaList.map((item) => (
          <div className="media-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>
              {item.media_type} • {item.status}
            </p>
            <p>Rating: {item.rating}</p>
            <p className="notes">{item.notes}</p>

            <div className="actions">
              <button onClick={() => handleEditClick(item)}>Edit</button>
              <button
                className="danger"
                onClick={() => handleDeleteClick(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

}
