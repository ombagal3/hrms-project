import { useState } from "react";

function EyeIcon({ isVisible }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="password-eye-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {isVisible ? (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M4 14s3.2 3 8 3 8-3 8-3" />
          <path d="M7 16.4l-1.4 2" />
          <path d="M12 17v2.3" />
          <path d="M17 16.4l1.4 2" />
        </>
      )}
    </svg>
  );
}

export default function PasswordInput({ className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`password-input-wrap ${className}`.trim()}>
      <input {...props} type={showPassword ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
      >
        <EyeIcon isVisible={showPassword} />
      </button>
    </div>
  );
}
