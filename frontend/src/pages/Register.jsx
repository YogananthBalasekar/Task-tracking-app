import { useState } from "react";
import { Form, Container } from "react-bootstrap";
import { signupUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import logo from "../assets/login.png";

export default function Register() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      message.error("Name is required");
      return false;
    }
    if (!form.email.trim()) {
      message.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      message.error("Please enter a valid email address");
      return false;
    }
    if (!form.password.trim()) {
      message.error("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      message.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setActive(true);

    try {
      const res = await signupUser(form);
      localStorage.setItem("token", res.data.token);
      message.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed. Please try again.";
      message.error(errorMsg);
      setActive(false);
    }
  };

  return (
    <Container className="login-wrapper py-1">
      <div className="login-card">
        <img src={logo} className="login-image" alt="task" />

        <h2 className="title">Create Account</h2>
        <p className="subtitle">Start organizing your tasks today</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <button
            type="submit"
            className={`email-btn ${active ? "active-btn" : ""}`}
            disabled={active}
          >
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.422147 0H17.5779C17.8105 0 18 0.214236 18 0.479002V15.521C18 15.7857 17.8112 16 17.5779 16H0.422147C0.189543 16 0 15.7858 0 15.521V0.479002C0 0.214257 0.188808 0 0.422147 0ZM17.1557 3.83928L9.27789 11.7729C9.11636 11.935 8.87513 11.9309 8.71862 11.7712L0.843578 3.83931V15.042H17.1557V3.83928ZM0.843578 2.56439L8.99926 10.7783L17.155 2.56439V0.95715H0.842843V2.56439H0.843578Z" fill="currentColor" />
            </svg>
            <span>{active ? "Creating..." : "Register"}</span>
          </button>
        </Form>

        <Link to="/" className="create-link">
          Already have an <span className="account-new">account</span>?
        </Link>
      </div>
    </Container>
  );
}