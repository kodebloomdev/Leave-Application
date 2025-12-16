import { useEffect, useState } from "react";
import axios from "axios";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Attendance() {
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [overview, setOverview] = useState({
    pct: 0,
    trend: 0,
    present: 0,
    total: 0,
    absent: 0,
    onLeave: 0,
  });

  const [classRows, setClassRows] = useState([]);
  const [recent, setRecent] = useState([]);
  const [monthly, setMonthly] = useState(0);

  const [open, setOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const loadAll = async (d) => {
    const params = { params: { date: d } };

    const [ov, cw, rc, ma, allStu] = await Promise.all([
      axios.get("http://localhost:5000/api/attendance/overview", params),
      axios.get("http://localhost:5000/api/attendance/classwise", params),
      axios.get("http://localhost:5000/api/attendance/recent", params),
      axios.get("http://localhost:5000/api/attendance/monthly-average", params),
      axios.get("http://localhost:5000/api/students/all"),
    ]);

    setOverview({
      pct: ov.data.pct,
      trend: ov.data.trend,
      present: ov.data.present,
      total: ov.data.total,
      absent: ov.data.absent,
      onLeave: ov.data.onLeave,
    });

    setClassRows(cw.data.rows);
    setRecent(rc.data.items);
    setMonthly(ma.data.average);
    setStudents(allStu.data.students);
  };

  useEffect(() => {
    loadAll(date);
  }, [date]);

  const openEdit = (row) => {
    setEditClass(row);
    const list = students.filter(
      (s) => `${s.class}-${s.section}` === `${row.class}-${row.section}`
    );
    setRecords(
      list.map((s) => ({
        studentId: s._id,
        name: s.name,
        status: "Present",
      }))
    );
    setOpen(true);
  };

  const save = async () => {
    await axios.post("http://localhost:5000/api/attendance/mark", {
      date,
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status,
      })),
    });
    setOpen(false);
    loadAll(date);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <Header />

        <div className="p-6">
          {/* Purple Banner */}
          <div className="bg-blue-400 text-white p-6 rounded-xl mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Attendance Overview</p>
              <h2 className="text-2xl font-semibold">
                Monitor daily attendance across classes
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-gray-800 rounded p-2"
              />
              <span className="text-sm">Today</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 text-sm">Overall Attendance Today</p>
              <p className="text-3xl font-bold mt-2">{overview.pct}%</p>
              <p className="text-sm text-gray-500 mt-1">
                Present: {overview.present} · Total students: {overview.total}
              </p>
              <p
                className={`text-xs mt-2 ${
                  overview.trend >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {overview.trend >= 0
                  ? `+${overview.trend}% vs yesterday`
                  : `${overview.trend}% vs yesterday`}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 text-sm">Absent & On Leave</p>
              <p className="text-3xl font-bold mt-2">
                {overview.absent + overview.onLeave}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {overview.absent} absent · {overview.onLeave} on leave
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 text-sm">Monthly Average</p>
              <p className="text-3xl font-bold mt-2">{monthly}%</p>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-5 rounded-xl shadow">
              <p className="font-medium mb-3">
                Class-wise Attendance Today
              </p>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-3">Class & Section</th>
                    <th className="p-3">Present / Total</th>
                    <th className="p-3">Attendance %</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classRows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">
                        {row.class} {row.section}
                      </td>
                      <td className="p-3">{row.presentTotal}</td>
                      <td className="p-3">{row.pct}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            row.status === "Strong"
                              ? "bg-green-100 text-green-600"
                              : row.status === "Average"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openEdit(row)}
                          className="text-blue-600"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="font-medium mb-3">
                Recent Absences & Leaves
              </p>

              {recent.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-center border-b pb-2 mb-2"
                >
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      {it.class} {it.section}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      it.status === "Absent"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {it.status === "Absent"
                      ? "Absent today"
                      : "On approved leave"}
                  </span>
                </div>
              ))}

              {recent.length === 0 && (
                <p className="text-sm text-gray-500">
                  No absences today
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Update attendance · {editClass.class}{" "}
                {editClass.section}
              </h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {records.map((r, idx) => (
                <div
                  key={r.studentId}
                  className="flex justify-between border-b py-2"
                >
                  <p>{r.name}</p>
                  <select
                    value={r.status}
                    onChange={(e) => {
                      const arr = [...records];
                      arr[idx].status = e.target.value;
                      setRecords(arr);
                    }}
                    className="border p-2 rounded"
                  >
                    <option>Present</option>
                    <option>Absent</option>
                    <option>On Leave</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
