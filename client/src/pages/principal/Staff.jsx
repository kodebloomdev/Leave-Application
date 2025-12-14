import { useEffect, useState } from "react";
import axios from "axios";

export default function Staff() {
  const [staff, setStaff] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", username: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await axios.get("http://localhost:5000/api/staff");
    setStaff(res.data.users);
  };
  useEffect(() => { load(); }, []);

  // Open Modal for Add or Edit
  const handleOpen = (staffData = null) => {
    setEditingStaff(staffData);
    setFormData(staffData ? { name: staffData.name||"", email: staffData.email||"", username: staffData.username||"", phone: staffData.phone||"", password: "" } : { name: "", email: "", username: "", phone: "", password: "" });
    setOpenModal(true);
  };

  // Submit Staff
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingStaff) {
        await axios.put(`http://localhost:5000/api/staff/${editingStaff._id}`, { name: formData.name, email: formData.email, username: formData.username, phone: formData.phone });
      } else {
        await axios.post("http://localhost:5000/api/staff", formData);
      }
      setOpenModal(false);
      await load();
    } finally {
      setLoading(false);
    }
  };

  // Delete Staff
  const deleteStaff = (id) => {
    if (confirm("Are you sure you want to remove this staff?")) {
      // Soft-delete: deactivate
      axios.patch(`http://localhost:5000/api/staff/${id}/active`, { active: false }).then(load);
    }
  };

  return (
    <div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        <button
          onClick={() => handleOpen()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
        >
          + Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-sm">
          
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Status</th>
              <th className="text-center w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {staff.map(s => (
              <tr key={s._id} className="border-b">
                <td className="py-3">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.username}</td>
                <td>{s.phone}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${s.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                </td>

                <td className="flex gap-2 justify-center py-2">
                  <button
                    onClick={() => handleOpen(s)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStaff(s._id)}
                    className="text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => axios.patch(`http://localhost:5000/api/staff/${s._id}/active`, { active: !s.active }).then(load)}
                    className="text-purple-600 hover:underline"
                  >
                    {s.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow">

            <h3 className="text-xl font-semibold mb-4">
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border p-2 rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full border p-2 rounded"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full border p-2 rounded"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              {!editingStaff && (
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-2 rounded"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              )}

              <div className="flex gap-3 mt-4">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded w-full hover:bg-purple-700 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {editingStaff ? "Update" : "Add"}
                </button>

                <button
                  className="border px-4 py-2 rounded w-full hover:bg-gray-100"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
