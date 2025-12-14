import Timetable from "../models/Timetable.js";
import ScheduleChange from "../models/ScheduleChange.js";
import Student from "../models/Student.js";

function defaultWeek() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const periods = [
    { startTime: "08:30", endTime: "09:10" },
    { startTime: "09:10", endTime: "09:50" },
    { startTime: "10:00", endTime: "10:40" },
    { startTime: "10:40", endTime: "11:20" },
    { startTime: "11:40", endTime: "12:20" },
  ];
  return days.map((d) => ({ name: d, periods: periods.map((p) => ({ ...p, type: "Free" })) }));
}

export const listClasses = async (req, res) => {
  try {
    const students = await Student.find({}, { class: 1, section: 1 });
    const set = new Set(students.map((s) => `${s.class}-${s.section}`));
    const classes = Array.from(set).map((v) => ({ class: v.split("-")[0], section: v.split("-")[1] }));
    res.json({ classes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getWeek = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    let tt = await Timetable.findOne({ class: cls, section });
    if (!tt) tt = await Timetable.create({ class: cls, section, week: defaultWeek() });
    res.json({ timetable: tt });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const upsertPeriod = async (req, res) => {
  try {
    const { class: cls, section, dayIndex, periodIndex, data } = req.body;
    let tt = await Timetable.findOne({ class: cls, section });
    if (!tt) tt = await Timetable.create({ class: cls, section, week: defaultWeek() });
    const defWeek = defaultWeek();
    if (!tt.week || tt.week.length === 0) tt.week = defWeek;
    if (!tt.week[dayIndex]) tt.week[dayIndex] = defWeek[dayIndex];
    if (!tt.week[dayIndex].periods[periodIndex]) tt.week[dayIndex].periods[periodIndex] = defWeek[dayIndex].periods[periodIndex];
    const cur = tt.week[dayIndex].periods[periodIndex];
    cur.startTime = data.startTime ?? cur.startTime ?? defWeek[dayIndex].periods[periodIndex].startTime;
    cur.endTime = data.endTime ?? cur.endTime ?? defWeek[dayIndex].periods[periodIndex].endTime;
    cur.subject = data.subject ?? cur.subject ?? "";
    cur.teacher = data.teacher ?? cur.teacher ?? "";
    cur.room = data.room ?? cur.room ?? "";
    cur.type = data.type ?? cur.type ?? "Regular";
    cur.notes = data.notes ?? cur.notes ?? "";
    tt.week[dayIndex].periods[periodIndex] = cur;
    await tt.save();
    if (data.type && data.type !== "Regular") {
      await ScheduleChange.create({
        date: new Date(),
        class: cls,
        section,
        periodIndex,
        change: data.notes || `${data.type} for ${data.subject || "period"}`,
        appliesTo: data.teacher || "",
        type: data.type === "Free" ? "Free period" : data.type === "Substitution" ? "Substitution" : data.type === "Remedial" ? "Remedial" : "Schedule change",
      });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const copySchedule = async (req, res) => {
  try {
    const { fromClass, fromSection, toClass, toSection } = req.body;
    const src = await Timetable.findOne({ class: fromClass, section: fromSection });
    if (!src) return res.status(404).json({ message: "Source timetable not found" });
    let dest = await Timetable.findOne({ class: toClass, section: toSection });
    if (!dest) dest = await Timetable.create({ class: toClass, section: toSection, week: defaultWeek() });
    dest.week = JSON.parse(JSON.stringify(src.week));
    await dest.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    const tt = await Timetable.findOne({ class: cls, section });
    if (!tt) return res.json({ periodsToday: 0, substitutionsToday: 0, freePeriods: 0, current: null });
    const todayIdx = new Date().getDay(); // Sun=0
    const dayIndex = Math.max(0, todayIdx - 1);
    const day = tt.week[dayIndex];
    const now = new Date();
    const toMin = (s) => { const [h,m]=s.split(":").map(Number); return h*60+m; };
    const currentIdx = day.periods.findIndex(p => {
      const st = toMin(p.startTime);
      const en = toMin(p.endTime);
      const cur = now.getHours()*60 + now.getMinutes();
      return cur>=st && cur<en;
    });
    const periodsToday = day.periods.length;
    const substitutionsToday = day.periods.filter(p => p.type === "Substitution").length;
    const freePeriods = day.periods.filter(p => p.type === "Free").length;
    const current = currentIdx>=0 ? { index: currentIdx, period: day.periods[currentIdx] } : null;
    res.json({ periodsToday, substitutionsToday, freePeriods, current });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getChangesToday = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const items = await ScheduleChange.find({ class: cls, section, date: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
