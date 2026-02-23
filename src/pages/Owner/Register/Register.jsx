

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.css";
import SmartLogo from "../../../assets/image/smartlogo.svg?react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    shop: "",
    phone: "",
    location: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation rules using regex patterns
  const nameRegex = /^[A-Za-z\s.'-]{2,50}$/; // Full name pattern
  const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/; // Nigerian phone pattern
  const shopNameRegex = /^[A-Za-z0-9\s.,'-]{2,50}$/; // Allows letters, numbers & punctuation

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for a field as user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (!nameRegex.test(formData.fullName)) {
      newErrors.fullName = "Enter a valid name (letters and spaces only).";
    }

    if (!formData.shop.trim()) {
      newErrors.shop = "Shop name is required.";
    } else if (!shopNameRegex.test(formData.shop)) {
      newErrors.shop = "Shop name contains invalid characters.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid Nigerian phone number.";
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the Terms & Conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log("Form submitted:", formData);
    navigate("/owner/verify", { state: { formData } });
  };

  return (
    <div className={styles.container}>
      {/* Left Pane */}
      <div className={styles.leftPane}>
        <div className={styles.overlay}>
          <h1>Welcome!!!</h1>
          <h2>
            Prevent Inventory Losses
            <br />
            Before They Happen
          </h2>
        </div>
      </div>

      {/* Right Pane */}
      <div className={styles.rightPane}>
        <div className={styles.innerBox}>
          <div className={styles.logo}>
            <SmartLogo />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Register</h2>
            <p className={styles.subTitle}>
              Welcome!!!
              <br />
              Prevent Inventory Losses Before They Happen
            </p>

            {/* Full Name */}
            <label>
              Full name<span className={styles.required}>*</span>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
            </label>

            {/* Shop name */}
            <label>
              Shop name<span className={styles.required}>*</span>
              <div >
                <input
                  type="text"
                  name="shop"
                  placeholder="Enter shop name"
                  value={formData.shop}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.shop && <p className={styles.error}>{errors.shop}</p>}
            </label>

            {/* Phone number */}
            <label>
              Phone number<span className={styles.required}>*</span>
              <input
                type="tel"
                name="phone"
                placeholder="+234 803 XXX 4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className={styles.error}>{errors.phone}</p>}
            </label>

            {/* Shop location */}
            <label>
              Shop Location (Optional)
              <input
                type="text"
                name="location"
                placeholder="Enter shop location"
                value={formData.location}
                onChange={handleChange}
              />
            </label>

            {/* Terms and Conditions */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <a href="#" target="_blank">
                I agree to the Terms & Conditions and acknowledge that this platform complies with
              NDPR (Nigeria Data Protection Regulation)
              </a>
            </label>
            {errors.terms && <p className={styles.error}>{errors.terms}</p>}

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton}>
              Continue To Verification
            </button>
          </form>

          <p className={styles.footer}>
            Copyrights © 2026 - Next Gen Workforce
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
