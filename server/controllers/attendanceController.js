import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

function normalizeDate(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export const markAttendance = async (req, res) => {
  try {
    const date = normalizeDate(req.body.date || Date.now());
    const records = req.body.records || [];
    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.studentId, date },
        update: { $set: { status: r.status } },
        upsert: true,
      },
    }));
    if (ops.length > 0) await Attendance.bulkWrite(ops);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getOverview = async (req, res) => {
  try {
    const date = normalizeDate(req.query.date || Date.now());
    const total = await Student.countDocuments();
    const today = await Attendance.find({ date });
    const present = today.filter((a) => a.status === "Present").length;
    const absent = today.filter((a) => a.status === "Absent").length;
    const onLeave = today.filter((a) => a.status === "On Leave").length;
    const pct = total === 0 ? 0 : Math.round(((present) / total) * 1000) / 10;

    const y = new Date(date);
    y.setDate(y.getDate() - 1);
    const yesterday = await Attendance.find({ date: y });
    const yPresent = yesterday.filter((a) => a.status === "Present").length;
    const yPct = total === 0 ? 0 : Math.round((yPresent / total) * 1000) / 10;
    const trend = Math.round((pct - yPct) * 10) / 10;

    res.json({ total, present, absent, onLeave, pct, trend });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getClasswise = async (req, res) => {
  try {
    const date = normalizeDate(req.query.date || Date.now());
    const students = await Student.find();
    const today = await Attendance.find({ date });
    const map = new Map();
    const statusById = new Map(today.map((a) => [String(a.student), a.status]));
    for (const s of students) {
      const key = `${s.class}-${s.section}`;
      if (!map.has(key)) map.set(key, { class: s.class, section: s.section, present: 0, total: 0 });
      const row = map.get(key);
      row.total += 1;
      const st = statusById.get(String(s._id));
      if (st === "Present") row.present += 1;
    }
    const out = Array.from(map.values()).map((r) => {
      const pct = r.total === 0 ? 0 : Math.round((r.present / r.total) * 1000) / 10;
      let status = "Average";
      if (pct >= 92) status = "Strong";
      else if (pct < 85) status = "Needs attention";
      return { class: r.class, section: r.section, presentTotal: `${r.present} / ${r.total}`, pct, status };
    }).sort((a,b)=> (a.class+a.section).localeCompare(b.class+b.section));
    res.json({ rows: out });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getRecentAbsences = async (req, res) => {
  try {
    const date = normalizeDate(req.query.date || Date.now());
    const rec = await Attendance.find({ date, status: { $in: ["Absent", "On Leave"] } })
      .populate("student")
      .sort({ updatedAt: -1 })
      .limit(10);
    const items = rec.map((r) => ({ id: r._id, name: r.student?.name, class: r.student?.class, section: r.student?.section, status: r.status }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMonthlyAverage = async (req, res) => {
  try {
    const base = normalizeDate(req.query.date || Date.now());
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const total = await Student.countDocuments();
    let sumPct = 0;
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const rec = await Attendance.countDocuments({ date: new Date(d), status: "Present" });
      if (total > 0) {
        const pct = Math.round((rec / total) * 1000) / 10;
        sumPct += pct;
        days += 1;
      }
    }
    const avg = days === 0 ? 0 : Math.round((sumPct / days) * 10) / 10;
    res.json({ average: avg });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
