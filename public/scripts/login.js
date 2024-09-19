

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#js-login-button').addEventListener('click', async () => {
    const email  = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    const request = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const response = await request.json()
    console.log(response)

    localStorage.setItem('token', response.token)

    if (request.status === 200) {
      window.location.href = '/home'
    } else {
      document.querySelector('.js-error-message').innerHTML = response.error
      document.querySelector('#error-message').classList.remove('hidden')
      setTimeout(() => {
        document.querySelector('#error-message').classList.add('hidden')
      }, 2000);
    }
  })
})