const emailInput = document.getElementById("email");
const otpInput = document.getElementById("OTP");
const passwordInput = document.getElementById("password");
const sendCodeButton = document.querySelector(
  'button[type="send-code-button"]'
);
const verifyCodeButton = document.querySelector(
  'button[type="verify-code-button"]'
);
const resetPasswordButton = document.querySelector(
  'button[type="reset-password-button"]'
);

loader = document.getElementById("loader");

// Add event listeners to the buttons
sendCodeButton.addEventListener("click", sendCode);
verifyCodeButton.addEventListener("click", verifyCode);
resetPasswordButton.addEventListener("click", resetPassword);

// Function to handle sending the OTP
function sendCode(event) {
  event.preventDefault();

  loader.hidden = false;

  fetch("/send-otp-reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailInput.value }),
  })
    .then((response) => response.json())
    .then((data) => {
      loader.hidden = true;
      if (data.error) {
        alert(data.error);
      } else {
        otpInput.style.display = "block";
        verifyCodeButton.style.display = "block";
        sendCodeButton.style.display = "none";
        emailInput.style.display = "none";
      }
    });
}

// Function to handle verifying the OTP
function verifyCode(event) {
  event.preventDefault();

  fetch("/verify-otp-reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp: otpInput.value }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        passwordInput.style.display = "block";
        resetPasswordButton.style.display = "block";
        verifyCodeButton.style.display = "none";
        emailInput.style.display = "none";
        otpInput.style.display = "none";
      }
    });
}

// Function to handle resetting the password
function resetPassword(event) {
  event.preventDefault();

  fetch("/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailInput.value,
      otp: otpInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Password reset successfully!");
        window.location.href = "/login";
      }
    });
}
