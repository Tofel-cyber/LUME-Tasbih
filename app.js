function login() {
  if (!window.Pi) {
    alert("❌ Buka lewat Pi Browser");
    return;
  }

  console.log("🔑 Login dimulai");

  Pi.authenticate(
    ["username"],
    (auth) => {
      console.log("✅ Login sukses", auth);

      const user = auth.user;

      document.getElementById("status").innerText =
        "Assalamu'alaikum, " + user.username;

      document.getElementById("loginSection").style.display = "none";
      document.getElementById("modeSection").style.display = "block";
    },
    (err) => {
      console.error("❌ Login gagal", err);
      alert("Login Pi dibatalkan");
    }
  );
}
