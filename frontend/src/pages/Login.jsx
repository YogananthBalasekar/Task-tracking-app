import { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import logo from "../assets/login.png";
import email from "../assets/vector.png";
import { db } from "../utils/db"; 

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [active, setActive] = useState(false);
  const [savedUser, setSavedUser] = useState(null);

  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        const user = await db.user.get(1);
        if (user && user.email && user.password) {
          setSavedUser({ email: user.email, password: user.password });
        }
      } catch (error) {
        console.error("Failed to load saved user", error);
      }
    };
    loadSavedUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActive(true);

    const credentials = savedUser || form;

    try {
      const res = await loginUser(credentials);
      localStorage.setItem("token", res.data.token);
      message.success("Login successful");

      await db.user.put({
        id: 1,
        email: credentials.email,
        password: credentials.password,
        token: res.data.token
      });

      navigate("/dashboard");
    } catch (err) {
      message.error("Login failed");
      if (savedUser) {
        await db.user.delete(1);
        setSavedUser(null);
      }
      setActive(false);
    }
  };

  return (
    <Container className="login-wrapper py-1">
      <div className="login-card">
        <img src={logo} className="login-image" alt="task" />

        <h2 className="title">
           <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.1041 0C15.9521 4.73256 12.7992 7.76922 7.83483 8.92331C12.801 10.0809 15.954 13.1179 17.1041 17.8504C18.2505 13.1178 21.409 10.0811 26.3733 8.92331C21.4072 7.77118 18.2504 4.73233 17.1041 0Z" fill="url(#paint0_linear_1_206)" />
          <path d="M18.3108 23.3395C20.741 24.0814 22.402 25.6783 23.1528 28.0008C23.9034 25.6765 25.5644 24.076 28 23.3395C25.5642 22.5921 23.905 20.997 23.1528 18.6782C22.4022 20.997 20.7411 22.5975 18.3108 23.3395Z" fill="url(#paint1_linear_1_206)" />
          <path d="M2.51194 10.9241C2.03631 12.0543 1.18534 12.8746 0 13.3413C1.18353 13.808 2.03631 14.6301 2.51194 15.7586C2.98758 14.6283 3.84411 13.808 5.02389 13.3413C3.84407 12.8746 2.98758 12.0525 2.51194 10.9241Z" fill="url(#paint2_linear_1_206)" />
          <defs>
            <linearGradient id="paint0_linear_1_206" x1="7.04755" y1="5.2063" x2="24.4158" y2="18.7949" gradientUnits="userSpaceOnUse">
              <stop stop-color="#E2DAEE" />
              <stop offset="0.354399" stop-color="#ECF0FE" />
              <stop offset="0.682692" stop-color="#A4DD92" />
            </linearGradient>
            <linearGradient id="paint1_linear_1_206" x1="17.8993" y1="21.3973" x2="26.9717" y2="28.5007" gradientUnits="userSpaceOnUse">
              <stop stop-color="#E2DAEE" />
              <stop offset="0.354399" stop-color="#ECF0FE" />
              <stop offset="0.682692" stop-color="#A4DD92" />
            </linearGradient>
            <linearGradient id="paint2_linear_1_206" x1="-0.21335" y1="12.3341" x2="4.49125" y2="16.0171" gradientUnits="userSpaceOnUse">
              <stop stop-color="#E2DAEE" />
              <stop offset="0.354399" stop-color="#ECF0FE" />
              <stop offset="0.682692" stop-color="#A4DD92" />
            </linearGradient>
          </defs>
        </svg>
          <span>Welcome!</span></h2>


        <p className="subtitle">
          Plan your day with ease. Organize tasks, set goals, and stay on track
        </p>

        <Form onSubmit={handleSubmit}>
          {savedUser ? null : (
            <>
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
            </>
          )}

          <button
            type="submit"
            className={`email-btn ${active ? "active-btn" : ""}`}
          >
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.422147 0H17.5779C17.8105 0 18 0.214236 18 0.479002V15.521C18 15.7857 17.8112 16 17.5779 16H0.422147C0.189543 16 0 15.7858 0 15.521V0.479002C0 0.214257 0.188808 0 0.422147 0ZM17.1557 3.83928L9.27789 11.7729C9.11636 11.935 8.87513 11.9309 8.71862 11.7712L0.843578 3.83931V15.042H17.1557V3.83928ZM0.843578 2.56439L8.99926 10.7783L17.155 2.56439V0.95715H0.842843V2.56439H0.843578Z" fill="currentColor" />
            </svg>
            <span>Continue with Email</span>
          </button>
        </Form>

        <Link to="/register" className="create-link">
          Create new <span className="account-new">account</span>
        </Link>
      </div>
    </Container>
  );
}