import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
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
      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      alert(
        "Registration Success"
      );

      navigate("/");
    } catch {
      alert("Error");
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card p-4 mx-auto"
        style={{ maxWidth: 400 }}
      >
        <h3 className="text-center">
          Register
        </h3>

        <form
          onSubmit={
            handleSubmit
          }>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="form-control mb-3"
            onChange={
              handleChange
            }
          />

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

          <button className="btn btn-primary w-100">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;