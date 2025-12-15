import { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiArrowRight,
  FiArrowLeft,
  FiUpload,
  FiCamera,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import Webcam from "react-webcam";
import JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";

const API_URL = "http://localhost:5000";

function NewLeaveRequest() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [step, setStep] = useState(1);
  const [leaveId, setLeaveId] = useState("");

  /* ================= STUDENTS ================= */
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  /* ================= FORM ================= */
  const [guardian, setGuardian] = useState("");
  const [guardianPhotoUrl, setGuardianPhotoUrl] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("Weekend Leave");
  const [notes, setNotes] = useState("");

  /* ================= OTP ================= */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  /* ================= GATE PASS ================= */
  const [gatePass, setGatePass] = useState(null);
  const barcodeRef = useRef(null);
  const printRef = useRef(null);

  /* ================= CAMERA ================= */
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraId, setCameraId] = useState(null);

  /* ================================================= */
  /* LOAD STUDENTS */
  /* ================================================= */
  useEffect(() => {
    axios
      .get(`${API_URL}/api/staff/assigned/${user.id}`)
      .then((res) => {
        setStudents(res.data.students || []);
        setFilteredStudents(res.data.students || []);
      })
      .catch(() => alert("Failed to load students"));
  }, []);

  /* ================================================= */
  /* AUTO SELECT CAMERA */
  /* ================================================= */
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cams = devices.filter((d) => d.kind === "videoinput");
      if (cams.length > 0) setCameraId(cams[0].deviceId);
    });
  }, []);

  /* ================================================= */
  /* SEARCH */
  /* ================================================= */
  const handleSearch = (val) => {
    setSearch(val);
    setFilteredStudents(
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(val.toLowerCase()) ||
          s.admissionNo.includes(val)
      )
    );
  };

  /* ================================================= */
  /* PHOTO UPLOAD */
  /* ================================================= */
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);

    const res = await axios.post(`${API_URL}/api/leave/upload-photo`, fd);
    if (res.data.success) setGuardianPhotoUrl(res.data.photo);
  };

  /* ================================================= */
  /* CAMERA */
  /* ================================================= */
  const openCamera = () => {
    if (!guardian) return alert("Select guardian first");
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Camera not ready");
    const blob = await fetch(imageSrc).then((r) => r.blob());
    handlePhotoUpload(blob);
    setShowCamera(false);
  };

  /* ================================================= */
  /* SEND OTP */
  /* ================================================= */
  const sendOTP = async () => {
    await axios.post(`${API_URL}/api/leave/send-otp`, {
      studentId: selectedStudent._id,
      guardian,
      departure,
      returnDate,
      purpose,
      notes,
      guardianPhoto: guardianPhotoUrl,
      createdBy: user.id,
    });
    setStep(3);
  };

  /* ================================================= */
  /* VERIFY OTP */
  /* ================================================= */
  const verifyOTP = async () => {
    const res = await axios.post(`${API_URL}/api/leave/verify-otp`, {
      otp: otp.join(""),
      studentId: selectedStudent._id,
    });
    setGatePass(res.data.gatePass);
    setLeaveId(res.data.leaveId);
    setStep(4);
  };

  /* ================================================= */
  /* BARCODE */
  /* ================================================= */
  useEffect(() => {
    if (gatePass?.passId && barcodeRef.current) {
      JsBarcode(barcodeRef.current, gatePass.passId, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
      });
    }
  }, [gatePass]);

  /* ================================================= */
  /* PRINT (SAFE) */
  /* ================================================= */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "GatePass",
  });

  /* ================================================= */
  /* UI */
  /* ================================================= */
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">New Leave Request</h1>

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Select Student</h2>

          <input
            className="border p-2 rounded w-full mb-3"
            placeholder="Search admission no or name"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="border rounded max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Adm No</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Class</th>
                  <th className="p-2 text-left">Section</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => (
                  <tr
                    key={stu._id}
                    onClick={() => setSelectedStudent(stu)}
                    onDoubleClick={() => {
                      setSelectedStudent(stu);
                      setStep(2);
                    }}
                    className={`cursor-pointer ${
                      selectedStudent?._id === stu._id
                        ? "bg-blue-200"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <td className="p-2">{stu.admissionNo}</td>
                    <td>{stu.name}</td>
                    <td>{stu.class}</td>
                    <td>{stu.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            disabled={!selectedStudent}
            onClick={() => setStep(2)}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 ml-auto flex"
          >
            Next <FiArrowRight />
          </button>
        </div>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="mb-3">
            <strong>Student:</strong> {selectedStudent.name}
          </p>

          <select
            className="border p-2 rounded w-full mb-3"
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
          >
            <option value="">Select Guardian</option>
            <option>Father</option>
            <option>Mother</option>
            <option>Uncle</option>
          </select>

          <select
            className="border p-2 rounded w-full mb-3"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option>Weekend Leave</option>
            <option>Medical Leave</option>
            <option>Family Function</option>
            <option>Emergency</option>
          </select>

          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 border rounded flex items-center justify-center overflow-hidden">
              {guardianPhotoUrl ? (
                <img
                  src={`${API_URL}${guardianPhotoUrl}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">No Photo</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="bg-orange-500 text-white px-4 py-2 rounded cursor-pointer flex gap-2">
                <FiUpload /> Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files[0])}
                />
              </label>

              <button
                onClick={openCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"
              >
                <FiCamera /> Camera
              </button>
            </div>
          </div>

          {showCamera && (
            <div className="border p-3 rounded mb-4">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: cameraId ? { exact: cameraId } : undefined,
                }}
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={capturePhoto}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Capture
                </button>
                <button
                  onClick={() => setShowCamera(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="datetime-local"
              className="border p-2 rounded"
              onChange={(e) => setDeparture(e.target.value)}
            />
            <input
              type="datetime-local"
              className="border p-2 rounded"
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          <textarea
            rows="3"
            className="border p-2 rounded w-full mb-4"
            placeholder="Additional notes"
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-300 px-4 py-2 rounded flex gap-2"
            >
              <FiArrowLeft /> Back
            </button>
            <button
              onClick={sendOTP}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Send OTP
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex gap-2 mb-4">
            {otp.map((d, i) => (
              <input
                key={i}
                maxLength={1}
                className="border w-12 h-12 text-center"
                value={d}
                onChange={(e) => {
                  const copy = [...otp];
                  copy[i] = e.target.value;
                  setOtp(copy);
                }}
              />
            ))}
          </div>

          <button
            onClick={verifyOTP}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* ================= STEP 4 ================= */}
      {step === 4 && (
        <div
          ref={printRef}
          className="bg-white p-6 rounded-xl shadow text-center"
        >
          <h2 className="text-green-600 text-xl font-semibold mb-3">
            Gate Pass Approved
          </h2>

          <div className="flex justify-center my-4">
            <svg ref={barcodeRef}></svg>
          </div>

          <p><strong>Pass ID:</strong> {gatePass?.passId}</p>
          <p><strong>Student:</strong> {selectedStudent.name}</p>
          <p><strong>Guardian:</strong> {guardian}</p>

          <button
            disabled={!gatePass}
            onClick={handlePrint}
            className={`px-4 py-2 rounded mt-4 ${
              gatePass ? "bg-green-600 text-white" : "bg-gray-400"
            }`}
          >
            Print Gate Pass
          </button>
        </div>
      )}
    </div>
  );
}

export default NewLeaveRequest;
