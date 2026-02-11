let user = null;

// ===== LOGIN PI =====
function login() {
  if (!window.Pi) {
    alert("❌ Pi SDK belum siap. Buka lewat Pi Browser.");
    return;
  }

  Pi.authenticate(
    ["username", "payments"],
    function (auth) {
      console.log("✅ LOGIN BERHASIL:", auth);
      user = auth.user;

      document.getElementById("status").innerText =
        "Assalamu'alaikum, " + user.username;

      document.getElementById("userInfo").innerText =
        "👤 " + user.username;
      document.getElementById("userInfo").style.display = "block";

      document.getElementById("loginSection").style.display = "none";
      document.getElementById("modeSection").style.display = "block";
    },
    function (error) {
      console.error("❌ LOGIN GAGAL:", error);
      alert("Login Pi gagal:\n" + JSON.stringify(error));
    }
  );
}

// ===== MODE =====
function startFree() {
  document.getElementById("tasbihSection").style.display = "block";
}

function startPremium() {
  alert("Premium akan aktif via Pi Payment (next step)");
  document.getElementById("tasbihSection").style.display = "block";
}
