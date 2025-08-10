let login_button = document.getElementById("login-button");
let signup_button = document.getElementById("signup-button");
let forgot_password = document.getElementById("forgot-password");
let signup_otp_button = document.getElementById("otp-button");

let signup = document.getElementById("signup");
let back_arrow = document.getElementById("back-arrow");
let wrong_email = document.getElementById("wrong-email");

let login_box = document.querySelector(".login-box");
let signup_box = document.querySelector(".signup-box");
let signup_otp_box = document.querySelector(".signup-otp-box");

signup.addEventListener("click", function (event) {
  event.preventDefault();
  login_box.classList.remove("active");
  setTimeout(() => {
    signup_box.classList.add("active");
  }, 500);
});

back_arrow.addEventListener("click", function (event) {
  event.preventDefault();
  signup_box.classList.remove("active");
  setTimeout(() => {
    login_box.classList.add("active");
  }, 500);
});

login_button.addEventListener("click", function (event) {
  event.preventDefault();
  let username = document.getElementById("username_login").value;
  let password = document.getElementById("password_login").value;
  fetch("/login_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("error" + data.error); // change this
      } else {
        window.location.href = "/home";
      }
    });
});

forgot_password.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "/forgot_password";
});

signup_button.addEventListener("click", function (event) {
  event.preventDefault();
  let username = document.getElementById("username_signup").value;
  let email = document.getElementById("email_signup").value;
  let password = document.getElementById("password_signup").value;

  signup_button.innerHTML = "Loading...";
  signup_button.style.pointerEvents = "none";

  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        signup_button.innerHTML = "Sign Up";
        signup_button.style.pointerEvents = "auto";
        alert("error " + data.error); // change this
      } else {
        signup_box.classList.remove("active");
        setTimeout(() => {
          signup_otp_box.classList.add("active");
        }, 500);
        document.getElementById("otp-email").innerHTML = email;
        signup_button.innerHTML = "Sign Up";
        signup_button.style.pointerEvents = "auto";
      }
    });
});

signup_otp_button.addEventListener("click", function (event) {
  event.preventDefault();
  let otp = document.getElementById("signup-otp-input").value;
  let username = document.getElementById("username_signup").value;
  let email = document.getElementById("email_signup").value;
  let password = document.getElementById("password_signup").value;

  fetch("/signup_otp_verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
      otp: otp,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("error " + data.error); // change this
      } else {
        window.location.href = "/home";
      }
    });
});

wrong_email.addEventListener("click", function (event) {
  event.preventDefault();
  signup_otp_box.classList.remove("active");
  setTimeout(() => {
    signup_box.classList.add("active");
  }, 500);
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
});