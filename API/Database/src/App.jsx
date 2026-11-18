
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./index.css";

const emptyForm = {
  name: "",
  email: "",
  course: "",
  phone: ""
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // READ: Fetch students from Supabase
  async function fetchStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setStudents(data || []);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form inputs
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // CREATE / UPDATE
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const student = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      course: form.course.trim(),
      phone: form.phone.trim() || null
    };

    const { error } = editingId
      ? await supabase
          .from("students")
          .update(student)
          .eq("id", editingId)
      : await supabase
          .from("students")
          .insert([student]);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(editingId
        ? "Student updated successfully!"
        : "Student added successfully!");

      setForm(emptyForm);
      setEditingId(null);
      await fetchStudents();
    }

    setLoading(false);
  }

  // EDIT
  function handleEdit(student) {
    setEditingId(student.id);

    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      phone: student.phone || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // DELETE
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete?")) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Student deleted successfully!");
      await fetchStudents();
    }

    setLoading(false);
  }

  // SEARCH
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="container">

      <header className="header">
        <div>
          <p>Student Management Dashboard</p>
        </div>
        
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Students</span>
          <h2>{students.length}</h2>
        </div>

        <div className="stat-card">
          <span>Database</span>
          <h2>PostgreSQL</h2>
        </div>

        <div className="stat-card">
          <span>Operations</span>
          <h2>CRUD</h2>
        </div>
      </section>

      <section className="form-card">
        <h2>{editingId ? "Update Student" : "Add New Student"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="course"
            placeholder="Course (e.g. MCA)"
            value={form.course}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : editingId
                ? "Save Changes"
                : "+ Add Student"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="table-card">
        <div className="table-header">
          <h2>Student Records</h2>

          <input
            className="search"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.phone || "-"}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        StudentHub | Built with React & Supabase
      </footer>

    </div>
  );
}

export default App;
