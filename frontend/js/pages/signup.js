const API = "http://10.136.202.228:8000";
async function signup() {
    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!full_name || !email || !password || !confirmPassword) {
        document.getElementById("error-msg").textContent = "Please fill in all fields.";
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById("error-msg").textContent = "Passwords do not match.";
        return;
    }

    if (password.length < 8) {
        document.getElementById("error-msg").textContent = "Password must be at least 8 characters long.";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById("error-msg").textContent = "Please enter a valid email address.";
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            // Save user info for use across pages
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "group-view.html";
        } else {
            // "Email already registered" or other backend errors shown here
            document.getElementById("error-msg").textContent = `${data.detail}.` || "Sign up failed. Please try again.";
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
