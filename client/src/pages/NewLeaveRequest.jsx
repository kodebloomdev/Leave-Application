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
  const [printType, setPrintType] = useState("SCHOOL"); // SCHOOL | PARENT


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

  /* ================= GUARDIAN DETAILS ================= */
const [guardianDetails, setGuardianDetails] = useState(null);
const [otherGuardian, setOtherGuardian] = useState({
  name: "",
  phone: "",
  aadhar: "",
});


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
  const guardianPayload =
  guardian === "Others"
    ? {
        relation: "Others",
        name: otherGuardian.name,
        contact: otherGuardian.phone, // ✅ map phone → contact
        aadhar: otherGuardian.aadhar,
      }
    : guardianDetails;

  await axios.post(`${API_URL}/api/leave/send-otp`, {
    studentId: selectedStudent._id,
    guardian: guardianPayload,
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
  contentRef: printRef,
  documentTitle: "Gate Pass",
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
  onChange={(e) => {
    const value = e.target.value;
    setGuardian(value);

    if (value === "Others") {
      setGuardianDetails(null);
    } else {
      const found = selectedStudent?.guardians?.find(
        (g) => g.relation === value
      );
      setGuardianDetails(found || null);
    }
  }}
>
  <option value="">Select Guardian</option>
  <option>Father</option>
  <option>Mother</option>
  <option>GrandFather</option>
  <option>GrandMother</option>
  <option>Uncle</option>
  <option>Others</option>
</select>

{/* AUTO GUARDIAN DETAILS */}
{guardianDetails && (
  <div className="bg-gray-50 border rounded p-4 mb-4 text-sm">
    <p><strong>Name:</strong> {guardianDetails.name}</p>
   <p><strong>Contact:</strong> {guardianDetails?.contact}</p>
<p><strong>Aadhar:</strong> {guardianDetails?.aadhar}</p>

  </div>
)}
{/* OTHER GUARDIAN FORM */}
{guardian === "Others" && (
  <div className="bg-gray-50 border rounded p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">

    <input
      type="text"
      placeholder="Guardian Name"
      className="border p-2 rounded"
      value={otherGuardian.name}
      onChange={(e) =>
        setOtherGuardian({ ...otherGuardian, name: e.target.value })
      }
    />

    <input
      type="text"
      placeholder="Phone Number"
      className="border p-2 rounded"
      value={otherGuardian.phone}
      onChange={(e) =>
        setOtherGuardian({ ...otherGuardian, phone: e.target.value })
      }
    />

    <input
      type="text"
      placeholder="Aadhar Number"
      className="border p-2 rounded md:col-span-2"
      value={otherGuardian.aadhar}
      onChange={(e) =>
        setOtherGuardian({ ...otherGuardian, aadhar: e.target.value })
      }
    />

  </div>
)}


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
              type="date"
              className="border p-2 rounded"
              onChange={(e) => setDeparture(e.target.value)}
            />
            <input
              type="date"
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
  <div className="bg-white p-6 rounded-xl shadow text-center">

    {/* ================= PRINT AREA ================= */}
    <div ref={printRef} className="p-6 border rounded-lg max-w-lg mx-auto">

      <h2 className="text-lg font-bold mb-1">RESIDENTIAL SCHOOL</h2>
      <p className="text-xs text-gray-600 mb-2">
        OFFICIAL GATE PASS ({printType} COPY)
      </p>

      <hr className="my-3" />

      {/* BARCODE */}
      <div className="flex justify-center my-3">
        <svg ref={barcodeRef}></svg>
      </div>

      {/* DETAILS */}
      <div className="text-left text-sm space-y-1">

        <p><strong>Pass ID:</strong> {gatePass?.passId}</p>
        <p><strong>Student:</strong> {selectedStudent?.name}</p>
        <p><strong>Class:</strong> {selectedStudent?.class} - {selectedStudent?.section}</p>

        <p>
          <strong>Guardian:</strong>{" "}
          {guardian === "Others"
            ? otherGuardian.name
            : guardianDetails?.name}
        </p>

        <p>
          <strong>Contact:</strong>{" "}
          {guardian === "Others"
            ? otherGuardian.phone
            : guardianDetails?.contact}
        </p>

        {/* ✅ AADHAR NUMBER */}
  <p>
    <strong>Aadhar Number:</strong>{" "}
    {guardian === "Others"
      ? otherGuardian.aadhar
      : guardianDetails?.aadhar}
  </p>


        <p><strong>Purpose:</strong> {purpose}</p>

        <p><strong>Departure:</strong> {departure}</p>
        <p><strong>Return:</strong> {returnDate}</p>

        <p className="text-xs text-gray-500 mt-2">
          Issued by: {user?.name} | Time: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* GUARDIAN PHOTO */}
      {guardianPhotoUrl && (
        <div className="flex justify-center mt-4">
          <img
            src={`${API_URL}${guardianPhotoUrl}`}
            alt="Guardian"
            className="w-24 h-24 object-cover border rounded"
          />
        </div>
      )}
    </div>

    {/* ================= PRINT BUTTONS ================= */}
    <div className="flex justify-center gap-4 mt-6">

      {/* SCHOOL COPY */}
      <button
        onClick={() => {
          setPrintType("SCHOOL");
          setTimeout(handlePrint, 100);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        🏫 Print School Copy
      </button>

      {/* PARENT COPY */}
      <button
        onClick={() => {
          setPrintType("PARENT");
          setTimeout(handlePrint, 100);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        👨‍👩‍👧 Print Parent Copy
      </button>

    </div>

    {/* RETURN */}
    <button
      onClick={() => window.location.href = "/dashboard"}
      className="mt-4 text-sm text-blue-600 underline"
    >
      Return to Dashboard
    </button>
  </div>
)}
    </div>
  );
}

export default NewLeaveRequest;
