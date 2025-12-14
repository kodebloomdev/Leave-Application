import { useState } from "react";
import { 
  FiSearch, FiArrowRight, FiArrowLeft, 
  FiUpload, FiCamera 
} from "react-icons/fi";
import axios from "axios";

function NewLeaveRequest() {

  const [step, setStep] = useState(1);
  const [leaveId, setLeaveId] = useState("");   // ⭐ IMPORTANT


  // 👉 Student search states
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 👉 Step 2 form states
  const [guardian, setGuardian] = useState("");
  const [guardianPhotoUrl, setGuardianPhotoUrl] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("Weekend Leave");
  const [notes, setNotes] = useState("");

  // 👉 Step 3 OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // 👉 Step 4 Gate Pass
  const [gatePass, setGatePass] = useState(null);

  // -------------------------------------------------------
  // 🔎 STEP 1 — Search Student
  // -------------------------------------------------------
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/students/search?query=${search}`
      );

      if (!res.data.student) {
        alert("Student not found");
        return;
      }

      setSelectedStudent(res.data.student);
    } catch (err) {
      console.error(err);
      alert("Error fetching student");
    }
  };

  // -------------------------------------------------------
  // 📤 STEP 2 — Upload Guardian Photo
  // -------------------------------------------------------
  const handlePhotoUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/leave/upload-photo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setGuardianPhotoUrl(res.data.photo);
      } else {
        alert("Photo upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // -------------------------------------------------------
  // 📩 STEP 2 — Send OTP
  // -------------------------------------------------------
  const sendOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/leave/send-otp", {
        studentId: selectedStudent._id,
        guardian,
        departure,
        returnDate,
        purpose,
        notes,
        guardianPhoto: guardianPhotoUrl,
      });

      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  // -------------------------------------------------------
  // 🔢 STEP 3 — OTP Handling
  // -------------------------------------------------------
  const handleOtpChange = (value, index) => {
    const copy = [...otp];
    copy[index] = value.slice(-1);
    setOtp(copy);
  };

  const verifyOTP = async () => {
  const enteredOtp = otp.join("");

  try {
    const res = await axios.post("http://localhost:5000/api/leave/verify-otp", {
      otp: enteredOtp,
      studentId: selectedStudent._id,
    });

    if (res.data.success) {
      setGatePass(res.data.gatePass);
      setLeaveId(res.data.leaveId);  // ⭐ SAVE leaveId FROM BACKEND
      setStep(4);                    // Move to Step 4
    } else {
      alert("Invalid OTP");
    }
  } catch (err) {
    console.error(err);
    alert("OTP verification failed");
  }
};


  // -------------------------------------------------------
  // UI Starts
  // -------------------------------------------------------
  return (
    <div className="p-6">

      <h1 className="text-xl font-semibold mb-6">New Leave Request</h1>

      {/* ========================================================= */}
      {/* STEP 1 — SEARCH STUDENT */}
      {/* ========================================================= */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="font-semibold text-lg mb-4">Step 1: Select Student</h2>

          <div className="flex gap-3 mb-4">
            <input
              className="border p-2 rounded w-full"
              placeholder="Enter admission no or name"
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              onClick={handleSearch}
              className="bg-blue-600 px-4 py-2 text-white rounded flex items-center gap-2"
            >
              <FiSearch /> Search
            </button>
          </div>

          <button
            disabled={!selectedStudent}
            onClick={() => setStep(2)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 ml-auto"
          >
            Next <FiArrowRight />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2 — GUARDIAN + LEAVE DETAIL FORM */}
      {/* ========================================================= */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="font-semibold text-lg mb-4">
            Step 2: Guardian & Leave Details
          </h2>

          {/* Student Display */}
          <p className="mb-3 text-gray-700">
            <strong>Student:</strong> {selectedStudent.name}
          </p>

          {/* Guardian */}
          <label className="font-medium">Select Guardian</label>
          <select
            className="border p-2 rounded w-full mb-4"
            onChange={(e) => setGuardian(e.target.value)}
          >
            <option value="">Choose guardian...</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Uncle">Uncle</option>
          </select>

          {/* PHOTO UPLOAD */}
          <label className="font-medium">Guardian Photo</label>
          <div className="flex gap-3 mb-4">

            {/* Preview */}
            <div className="border w-24 h-24 flex items-center justify-center rounded overflow-hidden">
              {guardianPhotoUrl ? (
                <img src={guardianPhotoUrl} className="h-full w-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No Photo</span>
              )}
            </div>

            {/* Upload / Capture */}
            <div className="flex flex-col gap-2">

              {/* Upload Button */}
              <label className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
                <FiUpload /> Upload Photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>

              {/* Webcam button */}
              <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                <FiCamera /> Capture Live
              </button>

            </div>
          </div>

          {/* DATE-TIME */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label>Departure</label>
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>

            <div>
              <label>Return</label>
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          {/* Purpose */}
          <label>Purpose of Leave</label>
          <select
            className="border p-2 rounded w-full mb-4"
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option>Weekend Leave</option>
            <option>Medical Leave</option>
            <option>Family Function</option>
            <option>Emergency</option>
          </select>

          {/* Notes */}
          <label>Additional Notes</label>
          <textarea
            rows="3"
            className="border p-2 rounded w-full mb-4"
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-300 px-4 py-2 rounded flex items-center gap-2"
            >
              <FiArrowLeft /> Back
            </button>

            <button
              onClick={sendOTP}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              Send OTP
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3 — OTP VERIFICATION */}
      {/* ========================================================= */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="font-semibold text-lg mb-4">Step 3: Verify OTP</h2>

          <div className="flex gap-2 mb-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                maxLength={1}
                className="border w-12 h-12 rounded text-center text-lg"
                value={digit}
                onChange={(e) =>
                  handleOtpChange(e.target.value, i)
                }
              />
            ))}
          </div>

          <button className="text-blue-600 mb-4 underline">Resend OTP</button>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-300 px-4 py-2 rounded flex items-center gap-2"
            >
              <FiArrowLeft /> Back
            </button>

            <button
              onClick={verifyOTP}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
{/* STEP 4 — GATE PASS */}
{/* ========================================================= */}
{step === 4 && (
  <div className="bg-white p-6 rounded-xl shadow text-center">

    <h2 className="text-green-600 text-xl font-semibold mb-2">
      Leave Approved Successfully!
    </h2>

    <p className="text-gray-600 mb-6">
      OTP verified. Gate pass is ready.
    </p>

    {/* Gate Pass */}
    <div className="border p-6 rounded-xl mb-6 w-full md:w-1/2 mx-auto">
      <h3 className="font-semibold text-lg">RESIDENTIAL SCHOOL</h3>
      <p className="text-sm text-gray-700 mb-4">Official Gate Pass</p>

      <div className="bg-gray-300 w-48 h-20 mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">Scan at gate</p>

      <p className="mt-4 text-sm">
        <strong>Pass ID:</strong> {gatePass?.passId}
      </p>

      <p className="mt-1 text-sm">
        <strong>Approved:</strong>{" "}
        {new Date(gatePass?.approvedAt).toLocaleString()}
      </p>
    </div>

    {/* PRINT BUTTON */}
    <button
      onClick={() =>
        window.open(`http://localhost:5000/api/leave/gatepass/${leaveId}`)
      }
      className="bg-green-600 text-white px-4 py-2 rounded mr-2"
    >
      Print Gate Pass
    </button>

    {/* RETURN BUTTON */}
    <button
      onClick={() => (window.location.href = "/dashboard")}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Return to Dashboard
    </button>
  </div>
)}

    </div>
  );
}

export default NewLeaveRequest;
