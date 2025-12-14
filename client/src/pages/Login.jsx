import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Dummy credentials for testing
  const dummyUsers = {
    principal: {
      email: "principal@school.edu",
      password: "principal123",
      name: "Dr. Rajesh Kumar",
    },
    staff: {
      email: "staff@school.edu",
      password: "staff123",
      name: "Mrs. Priya Singh",
    },
    parent: {
      email: "parent@school.edu",
      password: "parent123",
      name: "Mr. Amit Sharma",
    },
  };

  const handleLogin = async () => {
    if (!role) {
      alert("Please select a role first");
      return;
    }

    setLoading(true);
    try {
      // Check against dummy data first
      const dummyUser = dummyUsers[role];
      if (email === dummyUser.email && password === dummyUser.password) {
        // Simulate successful login with dummy data
        const token = "dummy_token_" + role + "_" + Date.now();
        const userData = {
          id: "dummy_id_" + role,
          name: dummyUser.name,
          email: dummyUser.email,
          role: role,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", role);

        if (role === "principal") {
          nav("/principal");
        } else if (role === "staff") {
          nav("/dashboard");
        } else if (role === "parent") {
          nav("/parent-dashboard");
        }
        return;
      }

      // If dummy credentials don't match, try server
      const endpoint = "http://localhost:5000/api/auth/login";
      const payload = { email: email || undefined, username: username || undefined, password, role };
      const res = await axios.post(endpoint, payload);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("role", role);

        if (role === "principal") {
          nav("/principal");
        } else if (role === "staff") {
          nav("/dashboard");
        } else if (role === "parent") {
          nav("/parent-dashboard");
        }
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Login failed: " + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-xl shadow-xl w-96">
          <h2 className="text-2xl font-bold text-center mb-2">
            🎓 School Portal
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Select your role to continue
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setRole("principal")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              👨‍💼 Principal Login
            </button>

            <button
              onClick={() => setRole("staff")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              👩‍🏫 Staff Login
            </button>

            <button
              onClick={() => setRole("parent")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              👨‍👩‍👧 Parent Login
            </button>
          </div>

          <p className="text-center text-gray-500 mt-6">
            Need help? Contact admin@school.edu
          </p>
        </div>
      </div>
    );
  }

  const getRoleLabel = () => {
    const labels = {
      principal: "Principal",
      staff: "Staff",
      parent: "Parent",
    };
    return labels[role];
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🎓 {getRoleLabel()} Login</h2>
          <button
            onClick={() => {
              setRole(null);
              setEmail("");
              setUsername("");
              setPassword("");
            }}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <label className="block text-sm font-semibold mb-2">Email</label>
<input
  type="email"
  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
  placeholder={`${role}@school.edu`}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>


        <label className="block text-sm font-semibold mb-2">Password</label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-blue-500"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Logging in..." : `Login as ${getRoleLabel()}`}
        </button>

        
      </div>
    </div>
  );
}

export default Login;
