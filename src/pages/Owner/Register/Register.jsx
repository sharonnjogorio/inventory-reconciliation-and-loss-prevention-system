
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./RegisterPage.module.css";
import SmartLogo from '../../../assets/image/smartlogo.svg?react';
import UserIcon from '../../../assets/icon/user.svg?react'


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    shop: "",
    phone: "",
    location: "",
    terms: false,
  });

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    // navigate("/verifyPhone");

    // Option 2: Pass form data to next page via state
    navigate("/verifyPhone", { state: { formData } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <h1>Welcome!!!</h1>
        <p>Prevent Inventory Losses<br />Before They Happen</p>
      </div>
      <div className={styles.rightPane}>
        <div className={styles.logo}>
          <SmartLogo />
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Register</h2>
          <p>Welcome!!!<br />Prevent Inventory Losses Before They Happen</p>
          <label>
            Shop name *
            <input
              type="text"
              name="shop"
              value={formData.shop}
              onChange={handleChange}
              required

              Icon={UserIcon}
            />
          </label>

          <label>
            Phone number *
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required

            />
          </label>
          <label>
            Shop Location (Optional)
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}

            />
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
            />
            I agree to the Terms & Conditions and acknowledge that this platform complies with NDPR (Nigeria Data Protection Regulation)
          </label>
          <button type="submit">Continue To verification</button>
        </form>
        <p className={styles.footer}>Copyrights © 2026 - Next Gen Workforce</p>
      </div>
    </div>
  );
};

export default RegisterPage;
