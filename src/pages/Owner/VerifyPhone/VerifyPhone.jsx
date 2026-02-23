import React, { useState, useEffect } from "react";
import SmartLogo from "../../../assets/image/smartlogo.svg?react";
import { useNavigate } from "react-router-dom";
import styles from "./VerifyPhone.module.css";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Countdown
  useEffect(() => {
    if (timer > 0 && !verified) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) setExpired(true);
  }, [timer, verified]);

  // OTP input handler
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 3) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(120);
    setExpired(false);
    alert("OTP resent successfully!");
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 4) {
      alert("Please enter all 4 digits.");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      if (code === "5555") {
        setVerified(true);

        setTimeout(() => navigate("/owner/catalog"), 2000);
      } else {
        alert("Invalid OTP. Please try again.");
      }
    }, 2000);
  };

  const handleChangePhone = () => {
    alert("Redirecting to Change Phone Number...");
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.verifyWrapper}>
        <div className={styles.verifyForm}>
          {/* Progress Steps */}
          <div className={styles.progress}>
            <span className={styles.circle}>1</span>
            <span className={styles.line}></span>
            <span className={`${styles.circle} ${styles.active}`}>2</span>
            <span className={styles.line}></span>
            <span className={styles.circleNext}>3</span>
          </div>

          <div className={styles.card}>
            <SmartLogo className={styles.logo} />

            {verifying ? (
              // ⏳ Spinner while verifying
              <div className={styles.loadingBox}>
                <div className={styles.spinner}></div>
                <p>Verifying...</p>
              </div>
            ) : verified ? (
              // ✅ Success Checkmark
              <div className={styles.successBox}>
                <div className={styles.checkmark}></div>
                <h2>Verified Successfully!</h2>
                <p>Your phone number has been confirmed.</p>
              </div>
            ) : (
              // 🔢 OTP Section
              <>
                <h2>Verify Your Phone Number</h2>
                <p>
                  We’ve sent a 4-digit code to <strong>+234 803 XXX 4567</strong>
                </p>

                <div className={styles.otpInputs}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      className={styles.otpBox}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  ))}
                </div>

                <div className={styles.helperText}>
                  <span>Didn’t receive the code? </span>
                  <button onClick={handleResendOtp} className={styles.resendBtn}>
                    Resend OTP
                  </button>
                </div>

                <div className={styles.timerBox}>
                  <span className={styles.timerText}>
                    Code expires in:{" "}
                    <strong>{expired ? "00:00" : formatTime(timer)}</strong>
                  </span>
                </div>

                <button onClick={handleVerify} className={styles.verifyBtn}>
                  Verify and continue
                </button>

                <button onClick={handleChangePhone} className={styles.changeBtn}>
                  Change Phone number
                </button>

                <p className={styles.footer}>
                  Copyrights © 2026 – Next Gen Workforce
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
