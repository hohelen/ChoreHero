const API = "http://127.0.0.1:8000";

async function signup() {
    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!full_name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
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
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "hub.html";
        } else {
            // "Email already registered" or other backend errors shown here
            alert(data.detail || "Sign up failed. Please try again.");
        }
    } catch (err) {
        alert("Could not connect to the server. Make sure the backend is running.");
        console.error(err);
    }
}
