import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState({ id: "", name: "", email: "", phone: "", photo: "" });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const localUser = (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();

  useEffect(() => {
    const id = localUser?.id;
    if (!id) return;
    axios.get(`http://localhost:5000/api/auth/profile/${id}`).then((res)=>{
      const u = res.data.user || {};
      setUser({ id: u._id, name: u.name, email: u.email, phone: u.phone||"", photo: u.photo||"" });
      setForm({ name: u.name||"", email: u.email||"", phone: u.phone||"" });
    }).catch(()=>{
      setUser({ id: id, name: localUser.name||"", email: localUser.email||"", phone: "", photo: "" });
      setForm({ name: localUser.name||"", email: localUser.email||"", phone: "" });
    });
  }, []);

  const save = async () => {
    const id = user.id || localUser.id;
    const res = await axios.put(`http://localhost:5000/api/auth/profile/${id}`, form);
    const u = res.data.user;
    setUser({ id: u._id, name: u.name, email: u.email, phone: u.phone||"", photo: u.photo||"" });
    localStorage.setItem("user", JSON.stringify({ id: u._id, name: u.name, email: u.email }));
    setEditing(false);
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = user.id || localUser.id;
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("folder", "profile_photos");
    fd.append("prefix", "profile");
    const res = await axios.post(`http://localhost:5000/api/auth/profile/${id}/photo`, fd);
    const u = res.data.user;
    setUser({ id: u._id, name: u.name, email: u.email, phone: u.phone||"", photo: u.photo||"" });
  };

  return (
    <div className="w-full">
      <div className="bg-purple-600 text-white p-5 rounded-xl mb-6">
        <p className="text-sm">Profile</p>
        <h2 className="text-2xl font-semibold">Manage account information, preferences, and security</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {user.photo ? (
                <img src={user.photo} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">{(user.name||"?").charAt(0)}</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-gray-600 text-sm">Principal</p>
            </div>
            <div>
              {!editing ? (
                <button onClick={()=>setEditing(true)} className="px-3 py-2 rounded bg-purple-600 text-white">Edit Profile</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={save} className="px-3 py-2 rounded bg-green-600 text-white">Save</button>
                  <button onClick={()=>{ setEditing(false); setForm({ name: user.name, email: user.email, phone: user.phone }); }} className="px-3 py-2 rounded border">Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              {editing ? (
                <input className="border p-2 rounded w-full" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
              ) : (
                <p className="mt-2">{user.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              {editing ? (
                <input className="border p-2 rounded w-full" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
              ) : (
                <p className="mt-2">{user.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              {editing ? (
                <input className="border p-2 rounded w-full" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
              ) : (
                <p className="mt-2">{user.phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Profile Photo</label>
              <input type="file" accept="image/*" onChange={onPhoto} className="mt-2" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="font-medium text-gray-700 mb-3">Account & Security</p>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.phone || "-"}</p>
          </div>
          <div className="mt-4">
            <button className="w-full px-3 py-2 rounded bg-red-600 text-white" onClick={()=>{
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("role");
              window.location.href = "/";
            }}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
