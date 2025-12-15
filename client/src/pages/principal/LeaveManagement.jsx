import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function LeaveManagement() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalDays: 0 });
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [studentStats, setStudentStats] = useState({ totalDays: 0, history: [] });
  const [filters, setFilters] = useState({ status: "", klass: "", section: "", search: "", startDate: "", endDate: "" });
  const [justification, setJustification] = useState("");

  const load = async () => {
    const params = { params: { ...filters } };
    const [list, sum] = await Promise.all([
      axios.get("http://localhost:5000/api/leave/list", params),
      axios.get("http://localhost:5000/api/leave/analytics/summary", params),
    ]);
    setItems(list.data.items);
    setSummary(sum.data);
  };

  useEffect(() => { load(); }, [filters.status, filters.klass, filters.section, filters.startDate, filters.endDate]);

  useEffect(() => {
    const id = selected?.student?.id;
    if (!id) return;
    axios.get(`http://localhost:5000/api/leave/analytics/student/${id}`).then((res)=>{
      setStudentStats(res.data);
    });
  }, [selected]);

  const approve = async (row) => {
    await axios.patch(`http://localhost:5000/api/leave/${row._id}/approve`, { justification, decidedBy: "Principal" });
    setJustification("");
    await load();
    const updated = items.find((i) => i.id === row.id);
    setSelected(updated || null);
  };

  const reject = async (row) => {
    await axios.patch(`http://localhost:5000/api/leave/${row._id}/reject`, { justification, decidedBy: "Principal" });
    setJustification("");
    await load();
    const updated = items.find((i) => i.id === row.id);
    setSelected(updated || null);
  };

  const statusBadge = (s) => {
    const base = "px-2 py-1 rounded text-xs";
    if (s === "Approved") return `${base} bg-green-100 text-green-600`;
    if (s === "Rejected") return `${base} bg-red-100 text-red-600`;
    return `${base} bg-yellow-100 text-yellow-700`;
  };

  const filteredItems = useMemo(() => {
    const q = (filters.search || "").toLowerCase();
    return items.filter((i) => {
      const name = (i.student?.name || "").toLowerCase();
      const adm = (i.student?.admissionNo || "").toLowerCase();
      const okStatus = !filters.status || i.status === filters.status;
      const okClass = !filters.klass || i.student?.class === filters.klass;
      const okSec = !filters.section || i.student?.section === filters.section;
      const okSearch = !q || name.includes(q) || adm.includes(q);
      return okStatus && okClass && okSec && okSearch;
    });
  }, [items, filters]);

  console.log({ filteredItems });

  return (
    <div className="w-full">
      <div className="bg-purple-600 text-white p-5 rounded-xl mb-6">
        <p className="text-sm">Leave Management</p>
        <h2 className="text-2xl font-semibold">Overview of student leave status and days taken</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Total Requests</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">{summary.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Pending Requests</p>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{summary.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Accepted Requests</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{summary.approved}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Rejected Requests</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{summary.rejected}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow">
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <input className="border p-2 rounded" placeholder="Search student" value={filters.search} onChange={(e)=>setFilters({ ...filters, search: e.target.value })} />
            <select className="border p-2 rounded" value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <input type="date" className="border p-2 rounded" value={filters.startDate} onChange={(e)=>setFilters({ ...filters, startDate: e.target.value })} />
            <input type="date" className="border p-2 rounded" value={filters.endDate} onChange={(e)=>setFilters({ ...filters, endDate: e.target.value })} />
            <select className="border p-2 rounded" value={filters.klass} onChange={(e)=>setFilters({ ...filters, klass: e.target.value })}>
              <option value="">Class</option>
              {Array.from(new Set(items.map((i)=>i.student?.class).filter(Boolean))).map((c)=> (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="border p-2 rounded" value={filters.section} onChange={(e)=>setFilters({ ...filters, section: e.target.value })}>
              <option value="">Section</option>
              {Array.from(new Set(items.map((i)=>i.student?.section).filter(Boolean))).map((c)=> (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-3">Student</th>
                <th className="p-3">Class</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row) => (
                <tr key={row._id} className="border-b">
                  <td className="p-3">
                    <button onClick={()=>setSelected(row)} className="text-blue-600">{row.student?.name}</button>
                  </td>
                  <td className="p-3">{row.student?.class} {row.student?.section}</td>
                  <td className="p-3">{new Date(row.departureDate).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(row.returnDate).toLocaleDateString()}</td>
                  <td className="p-3">{row.days}</td>
                  <td className="p-3"><span className={statusBadge(row.status)}>{row.status}</span></td>
                  <td className="p-3">
                    {row.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <button onClick={()=>approve(row)} className="px-3 py-1 rounded bg-green-600 text-white">Accept</button>
                        <button onClick={()=>reject(row)} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length===0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="7">No leave requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-700 font-medium">{selected ? selected.student?.name : "Select a request"}</p>
            {selected && selected.status === "Pending" && (
              <div className="flex gap-2">
                <button onClick={()=>approve(selected)} className="px-3 py-1 rounded bg-green-600 text-white">Accept</button>
                <button onClick={()=>reject(selected)} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
              </div>
            )}
          </div>
          {selected ? (
            <div>
              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <p>Admission: {selected.student?.id}</p>
                <p>Class: {selected.student?.class} {selected.student?.section}</p>
                <p>Purpose: {selected.purpose}</p>
                <p>From: {new Date(selected.departureDate).toLocaleString()}</p>
                <p>To: {new Date(selected.returnDate).toLocaleString()}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Justification</p>
                <textarea value={justification} onChange={(e)=>setJustification(e.target.value)} className="border rounded w-full p-2 h-20" placeholder="Add decision note" />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-700">Recent leave history</p>
                <div className="mt-2 space-y-2">
                  {studentStats.history.map((h) => (
                    <div key={h.id} className="flex justify-between items-center border-b pb-1 text-sm">
                      <p>{h.purpose}</p>
                      <p>{h.days} days</p>
                    </div>
                  ))}
                  {studentStats.history.length === 0 && <p className="text-gray-500 text-sm">No history</p>}
                </div>
                <p className="text-xs text-gray-500 mt-2">Total days taken: {studentStats.totalDays}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Select a row to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
