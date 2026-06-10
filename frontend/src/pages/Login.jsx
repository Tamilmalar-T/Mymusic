import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      const res =
        await axios.post(
          "http://localhost:5000/api/auth/login",
          formData
        );

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate("/home");
    } catch (err) {
      alert(
        "Invalid Credentials"
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto"
        style={{ maxWidth: 400 }}>
        <h3 className="text-center">
          Spotify Login
        </h3>

        <form
          onSubmit={
            handleSubmit
          }>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-3"
            onChange={
              handleChange
            }
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control mb-3"
            onChange={
              handleChange
            }
          />

          <button className="btn btn-success w-100">
            Login
          </button>
        </form>

        <Link
          to="/register"
          className="mt-3">
          New User?
        </Link>
      </div>
    </div>
  );
}

export default Login;