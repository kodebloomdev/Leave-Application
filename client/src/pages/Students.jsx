import { useEffect, useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import axios from "axios";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    admissionNo: "",
    name: "",
    class: "",
    section: "",
    parentContact: "",
    attendanceStatus: "Present",
    enrollmentStatus: "Active",
    guardians: [{ name: "", relation: "", contact: "" }],
    assignedStaff: ""
  });
  const [staffList, setStaffList] = useState([]);
  const localUser = (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();
  const role = localStorage.getItem("role") || "";

  // Fetch all students
  // const getStudents = async () => {
  //   if (role === "staff" && localUser?.id) {
  //     const res = await axios.get(`http://localhost:5000/api/staff/assigned/${localUser.id}`);
  //     setStudents(res.data.students);
  //   } else {
  //     const res = await axios.get("http://localhost:5000/api/students/all");
  //     setStudents(res.data.students);
  //   }
  // };

  const getStudents = async () => {
    const res = await axios.get("http://localhost:5000/api/students/all");
    setStudents(res.data.students);
  };


  // Search students
  const searchStudents = async () => {
    if (search.trim() === "") return getStudents();

    const res = await axios.get(
      `http://localhost:5000/api/students/search?query=${search}`
    );

    setStudents(res.data.student ? [res.data.student] : []);
  };

  useEffect(() => {
    getStudents();
    axios.get("http://localhost:5000/api/staff").then((r)=>setStaffList(r.data.users));
  }, []);

  const resetForm = () => {
    setForm({
      admissionNo: "",
      name: "",
      class: "",
      section: "",
      parentContact: "",
      attendanceStatus: "Present",
      enrollmentStatus: "Active",
      guardians: [{ name: "", relation: "", contact: "" }],
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (stu) => {
    setForm({
      admissionNo: stu.admissionNo || "",
      name: stu.name || "",
      class: stu.class || "",
      section: stu.section || "",
      parentContact: stu.parentContact || "",
      attendanceStatus: stu.attendanceStatus || "Present",
      enrollmentStatus: stu.enrollmentStatus || "Active",
      guardians: stu.guardians?.length
        ? stu.guardians.map((g) => ({ name: g.name, relation: g.relation, contact: g.contact }))
        : [{ name: "", relation: "", contact: "" }],
      assignedStaff: stu.assignedStaff || ""
    });
    setEditingId(stu._id);
    setOpen(true);
  };

  const saveStudent = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/students/${editingId}`, form);
      } else {
        await axios.post("http://localhost:5000/api/students", form);
      }
      setOpen(false);
      resetForm();
      await getStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save student");
    }
  };

  const removeStudent = async (id) => {
    const ok = window.confirm("Are you sure you want to remove this student?");
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      await getStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove student");
    }
  };

  const classes = Array.from(
    new Set(students.map((s) => `${s.class} ${s.section}`))
  );

  const filtered = students.filter((s) => {
    if (!filterClass) return true;
    return `${s.class} ${s.section}` === filterClass;
  });

  const statusBadge = (status) => {
    const map = {
      Present: "bg-green-100 text-green-600",
      Absent: "bg-red-100 text-red-600",
      "On Leave": "bg-yellow-100 text-yellow-700",
    };
    const cls = map[status] || "bg-gray-100 text-gray-600";
    return <span className={`px-2 py-1 rounded text-xs ${cls}`}>{status}</span>;
  };

  return (
    <div className="p-6">

      {/* Title Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Student Management</h1>

        {role !== "staff" && (
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FiUserPlus className="text-lg" />
          Add Student
        </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by name or admission no..."
          className="border p-2 rounded w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={searchStudents}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiSearch /> Search
        </button>

        <select
          className="border p-2 rounded"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">Filter by class</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Admission No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Attendance Status</th>
              <th className="p-3">Parent Contact</th>
              <th className="p-3">Guardians</th>
              <th className="p-3">Assigned Staff</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}

            {filtered.map((stu) => (
              <tr
                key={stu._id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3">{stu.admissionNo}</td>
                <td className="p-3">{stu.name}</td>
                <td className="p-3">{stu.class + " - " + stu.section}</td>
                <td className="p-3">{statusBadge(stu.attendanceStatus)}</td>
                <td className="p-3">{stu.parentContact}</td>
                <td className="p-3">
                  {stu.guardians?.map((g) => (
                    <p key={g._id}>
                      {g.relation}: {g.name}
                    </p>
                  ))}
                </td>
                <td className="p-3">{stu.assignedStaff?.name || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => openEditModal(stu)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  {role !== "staff" && (
                    <button
                      onClick={() => removeStudent(stu._id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Student" : "Add Student"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Student name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                placeholder="Admission number"
                value={form.admissionNo}
                onChange={(e) => setForm({ ...form, admissionNo: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                placeholder="Class"
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                placeholder="Section"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                placeholder="Parent contact"
                value={form.parentContact}
                onChange={(e) => setForm({ ...form, parentContact: e.target.value })}
              />
              <select
                className="border p-2 rounded"
                value={form.attendanceStatus}
                onChange={(e) => setForm({ ...form, attendanceStatus: e.target.value })}
              >
                <option>Present</option>
                <option>Absent</option>
                <option>On Leave</option>
              </select>
              <select
                className="border p-2 rounded"
                value={form.enrollmentStatus}
                onChange={(e) => setForm({ ...form, enrollmentStatus: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <select
                className="border p-2 rounded"
                value={form.assignedStaff}
                onChange={(e) => setForm({ ...form, assignedStaff: e.target.value })}
              >
                <option value="">Assign to staff</option>
                {staffList.map((st)=> (
                  <option key={st._id} value={st._id}>{st.name} ({st.username || st.email})</option>
                ))}
              </select>
            </div>

            {/* Guardians */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Guardians</p>
                <button
                  className="text-blue-600"
                  onClick={() => setForm({
                    ...form,
                    guardians: [...form.guardians, { name: "", relation: "", contact: "" }]
                  })}
                >
                  + Add guardian
                </button>
              </div>
              {form.guardians.map((g, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <input
                    className="border p-2 rounded"
                    placeholder="Name"
                    value={g.name}
                    onChange={(e) => {
                      const arr = [...form.guardians];
                      arr[idx].name = e.target.value;
                      setForm({ ...form, guardians: arr });
                    }}
                  />
                  <input
                    className="border p-2 rounded"
                    placeholder="Relation"
                    value={g.relation}
                    onChange={(e) => {
                      const arr = [...form.guardians];
                      arr[idx].relation = e.target.value;
                      setForm({ ...form, guardians: arr });
                    }}
                  />
                  <input
                    className="border p-2 rounded"
                    placeholder="Contact"
                    value={g.contact}
                    onChange={(e) => {
                      const arr = [...form.guardians];
                      arr[idx].contact = e.target.value;
                      setForm({ ...form, guardians: arr });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={saveStudent} className="px-4 py-2 rounded bg-purple-600 text-white">Save student details</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Students;
