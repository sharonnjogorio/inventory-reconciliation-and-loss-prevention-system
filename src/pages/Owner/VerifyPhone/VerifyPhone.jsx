// VerifyPhone.jsx
import React, { useState } from 'react';
import styles from './VerifyPhone.module.css';
import SmartLogo from '../../../assets/image/smartlogo.svg?react'; // Replace with your logo path

const VerifyPhone = () => {
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput.focus();
    }
  };

  return (
    <div className={styles.container}>
      <SmartLogo/>
      
      <div className={styles.progress}>
        <div className={styles.step}>
          <div className={styles.circle}>1</div>
          <span>Account Info</span>
          <div className={styles.line}></div>
        </div>
        <div className={styles.step}>
          <div className={`${styles.circle} ${styles.active}`}>2</div>
          <span className={styles.activeText}>Verification</span>
          <div className={styles.line}></div>
        </div>
        <div className={styles.step}>
          <div className={styles.circle}>3</div>
          <span>Setup</span>
        </div>
      </div>

      <div className={styles.verificationBox}>
        <h2>Verify Your Phone Number</h2>
        <p>We've sent a 4-digit code to +234 803 XXX 4567</p>

        <div className={styles.otpInputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          ))}
        </div>

        <p className={styles.resend}>
          Didn't receive the code? <span>Resend OTP</span>
        </p>

        <div className={styles.timer}>Code expires in: 02:45</div>

        <button className={styles.verifyBtn}>Verify and continue</button>

        <p className={styles.changePhone}>Change Phone number</p>
      </div>

      <p className={styles.footer}>Copyrights © 2026 - Next Gen Workforce</p>
    </div>
  );
};

export default VerifyPhone;
