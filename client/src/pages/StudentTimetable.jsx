import { useEffect, useState } from "react";
import axios from "axios";


import Header from "./Header";
import Sidebar from "./Sidebar";


export default function TimeTable() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState({ class: "8", section: "A" });
  const [week, setWeek] = useState([]);
  const [summary, setSummary] = useState({ periodsToday: 0, substitutionsToday: 0, freePeriods: 0, current: null });
  const [changes, setChanges] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ startTime: "08:30", endTime: "09:10", subject: "", teacher: "", room: "", type: "Regular", notes: "" });

  const loadClasses = async () => {
    const res = await axios.get("http://localhost:5000/api/timetable/classes");
    setClasses(res.data.classes);
    if (res.data.classes[0]) setSelClass(res.data.classes[0]);
  };

  const loadWeek = async (c) => {
    const res = await axios.get("http://localhost:5000/api/timetable/week", { params: { class: c.class, section: c.section } });
    setWeek(res.data.timetable.week);
    const sum = await axios.get("http://localhost:5000/api/timetable/summary", { params: { class: c.class, section: c.section } });
    setSummary(sum.data);
    const ch = await axios.get("http://localhost:5000/api/timetable/changes", { params: { class: c.class, section: c.section } });
    setChanges(ch.data.items);
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selClass.class) loadWeek(selClass); }, [selClass]);

  const openEdit = (dayIdx, periodIdx) => {
    setEditing({ dayIdx, periodIdx });
    const p = week[dayIdx].periods[periodIdx];
    setForm({ startTime: p.startTime || "08:30", endTime: p.endTime || "09:10", subject: p.subject || "", teacher: p.teacher || "", room: p.room || "", type: p.type || "Regular", notes: p.notes || "" });
  };

  const save = async () => {
    await axios.post("http://localhost:5000/api/timetable/upsert", {
      class: selClass.class,
      section: selClass.section,
      dayIndex: editing.dayIdx,
      periodIndex: editing.periodIdx,
      data: form,
    });
    setEditing(null);
    await loadWeek(selClass);
  };

  const copyTo = async (target) => {
    await axios.post("http://localhost:5000/api/timetable/copy", {
      fromClass: selClass.class,
      fromSection: selClass.section,
      toClass: target.class,
      toSection: target.section,
    });
    alert("Schedule copied");
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
          <p className="text-sm">Time Table</p>
          <h2 className="text-2xl font-semibold">View and manage weekly schedules across classes and teachers</h2>
        </div>
        <div className="flex items-center gap-3">
          <select value={`${selClass.class}-${selClass.section}`} onChange={(e)=>{
            const [cl, sec] = e.target.value.split("-");
            setSelClass({ class: cl, section: sec });
          }} className="text-gray-800 rounded p-2">
            {classes.map((c)=> (
              <option key={`${c.class}-${c.section}`} value={`${c.class}-${c.section}`}>{c.class} {c.section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Periods Today</p>
          <p className="text-3xl font-bold mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">First period: 08:30 AM</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Substitutions Today</p>
          <p className="text-3xl font-bold mt-2">{summary.substitutionsToday}</p>
          <p className="text-sm text-gray-500 mt-1">Across all classes</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Free Periods</p>
          <p className="text-3xl font-bold mt-2">{summary.freePeriods}</p>
          <p className="text-sm text-gray-500 mt-1">Used for remedials or clubs</p>
        </div>
      </div>
    

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-700 font-medium">Weekly Time Table — Class {selClass.class} {selClass.section}</p>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded border" onClick={()=>setEditing({ dayIdx: 0, periodIdx: 0 })}>Add period</button>
              <select onChange={(e)=>{
                const target = classes.find(x => `${x.class}-${x.section}` === e.target.value);
                if (target) copyTo(target);
              }} className="px-3 py-2 rounded border">
                <option>Copy to another class</option>
                {classes.filter(c => c.class!==selClass.class || c.section!==selClass.section).map((c)=> (
                  <option key={`${c.class}-${c.section}`} value={`${c.class}-${c.section}`}>{c.class} {c.section}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3">Period</th>
                  {week.map((d)=> (<th key={d.name} className="p-3">{d.name}</th>))}
                </tr>
              </thead>
              <tbody>
                {week[0]?.periods.map((_, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3">{idx+1}</td>
                    {week.map((d, dayIdx) => {
                      const p = d.periods[idx];
                      return (
                        <td key={`${d.name}-${idx}`} className="p-3">
                          <div className="text-sm">
                            <p className="font-medium">{p.subject || "Free"}</p>
                            <p className="text-gray-500 text-xs">{p.teacher}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">{p.startTime}–{p.endTime}</span>
                              <span className={`text-xs px-2 py-1 rounded ${p.type==='Free'?'bg-yellow-100 text-yellow-700':p.type==='Substitution'?'bg-blue-100 text-blue-700':p.type==='Assembly'?'bg-purple-100 text-purple-700':'bg-green-100 text-green-700'}`}>{p.type||'Regular'}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <button onClick={()=>openEdit(dayIdx, idx)} className="text-blue-600 text-xs">Edit</button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-700 font-medium mb-3">Today&apos;s Key Changes</p>
          <div className="space-y-3">
            {changes.map((c)=> (
              <div key={c._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{c.change}</p>
                  <p className="text-xs text-gray-500">Period {c.periodIndex+1} · Applies: {c.appliesTo}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${c.type==='Substitution'?'bg-blue-100 text-blue-700':c.type==='Free period'?'bg-yellow-100 text-yellow-700':c.type==='Remedial'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>{c.type}</span>
              </div>
            ))}
            {changes.length===0 && <p className="text-gray-500 text-sm">No changes today</p>}
          </div>
        </div>
      </div>
      </div>
</div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Period</h2>
              <button onClick={()=>setEditing(null)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} placeholder="Start (HH:MM)" className="border p-2 rounded w-full" />
                <input value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} placeholder="End (HH:MM)" className="border p-2 rounded w-full" />
              </div>
              <input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} placeholder="Subject" className="border p-2 rounded w-full" />
              <input value={form.teacher} onChange={e=>setForm({...form, teacher:e.target.value})} placeholder="Teacher" className="border p-2 rounded w-full" />
              <input value={form.room} onChange={e=>setForm({...form, room:e.target.value})} placeholder="Room" className="border p-2 rounded w-full" />
              <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="border p-2 rounded w-full">
                <option>Regular</option>
                <option>Free</option>
                <option>Substitution</option>
                <option>Assembly</option>
                <option>Remedial</option>
              </select>
              <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Notes" className="border p-2 rounded w-full" />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={()=>setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded bg-purple-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
