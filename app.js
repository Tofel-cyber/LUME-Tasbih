function login() {
  const btn = document.getElementById("loginBtn");

  if (!window.Pi) {
    alert("❌ Harus dibuka lewat Pi Browser");
    return;
  }

  btn.disabled = true;

  Pi.authenticate(
    ["username", "payments"],
    (auth) => {
      console.log("✅ Login sukses:", auth);

      const user = auth.user;

      document.getElementById("status").innerText =
        "Assalamu'alaikum, " + user.username;

      document.getElementById("userInfo").innerText =
        "👤 " + user.username;

      document.getElementById("userInfo").style.display = "block";
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("modeSection").style.display = "block";

      btn.disabled = false;
    },
    (err) => {
      console.error("❌ Login gagal:", err);
      alert("Login Pi dibatalkan / gagal");
      btn.disabled = false;
    }
  );
}
