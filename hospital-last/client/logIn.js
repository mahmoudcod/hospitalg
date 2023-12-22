

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-container form');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = loginForm.username.value;
    const password = loginForm.password.value;

    try {
      const user = await window.electron.login(username, password);

      if (user) {
        const token = await window.electron.generateToken(user.userId);
        // Store the token securely
        document.cookie = `jwt=${token}; Secure; HttpOnly`;
        alert('Login successful!');
        window.location.href = 'veiw.html';
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      alert(error.message);
    }

    clearForm();
  });

  function clearForm() {
    loginForm.reset();
  }
});
