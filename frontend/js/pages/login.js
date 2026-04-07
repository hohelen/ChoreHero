const API = "http://127.0.0.1:8000"; // Change to your Railway URL when deployed

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        document.getElementById("error-msg").textContent = "Please enter both email and password";
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            // Save user info for use across pages
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "group-view.html";
        } else {
            // "Invalid email or password" shown here
            alert(data.detail || "Login failed. Please try again.");
        }
    } catch (err) {
        alert("Could not connect to the server. Make sure the backend is running.");
        console.error(err);
    }
}

function togglePassword(inputId, iconId) {
    var passwordInput = document.getElementById(inputId);
    var toggleIcon = document.getElementById(iconId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.src = "../assets/show-password-icon.png";
    } else {
        passwordInput.type = "password";
        toggleIcon.src = "../assets/hide-password-icon.png";
    }
}
