// Initialize the page
function init() {
 const sign_out_button = document.getElementById("sign_out_button");
  sign_out_button.addEventListener("click", (event) => {
    event.preventDefault();
    fetch("/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/";
        } else {
          alert("Logout failed");
        }
      });
  });
}

// Run the init function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);
