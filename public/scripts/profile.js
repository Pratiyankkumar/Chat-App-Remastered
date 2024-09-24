const token = localStorage.getItem('token')
console.log(token)

const fileUploadIcon = document.querySelector('.js-upload-file')
const fileInput = document.getElementById('fileInput')

fileUploadIcon.addEventListener('click', function() {
  // Trigger the file input click event
  fileInput.click();
});

fileInput.addEventListener('change', async function (event) {
  document.querySelector('.js-uploading-message').classList.remove('hidden')
  const file = event.target.files[0]

  if (file) {
    const formData = new FormData()
    formData.append('avatar', file)

    const avatarUploadRequest = await fetch('https://chat-app-remastered.onrender.com/users/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (avatarUploadRequest.status === 200) {
      document.querySelector('.js-uploading-message').classList.add('hidden')
      window.location.reload()
    } else {
      document.querySelector('.js-uploading-message').classList.add('hidden')
      document.querySelector('.js-upload-error-message').classList.remove('hidden')
      setTimeout(() => {
        document.querySelector('.js-upload-error-message').classList.add('hidden')
      }, 2000);
    }
    const userAvatar = await avatarUploadRequest.text()
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const request = await fetch('https://chat-app-remastered.onrender.com/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const response = await request.json();

  if (response.avatar) {
    // Convert the buffer to a Blob and then read it as base64
    const bufferData = new Uint8Array(response.avatar.data);
    const blob = new Blob([bufferData], { type: 'image/png' });

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Set the base64 string as the src of the image
      document.querySelector('.js-image-container').innerHTML = `
        <img class="w-24 h-24 rounded-full object-cover mb-4" src="${base64String}" alt="">
      `;
    };
    reader.readAsDataURL(blob);
  } else {
    document.querySelector('.js-image-container').innerHTML = `
      <div class="w-24 h-24 rounded-full object-cover mb-4 text-4xl flex items-center justify-center shadow-md border-2 border-gray-600">
        ${response.name[0].toUpperCase()}
      </div>
    `
  }

  document.getElementById('js-name').innerHTML = response.name;
  document.getElementById('js-email').innerHTML = response.email;

  document.getElementById('js-delete-profile').addEventListener('click', async () => {
    const userDeleteRequest = await fetch('https://chat-app-remastered.onrender.com/users/me', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const deletedUser = await userDeleteRequest.json()

    if (userDeleteRequest.status === 200) {
      document.querySelector('.js-user-delete-message').classList.remove('hidden')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000);
    }
  })

  document.querySelector('.js-upadate-profile').addEventListener('click', () => {
    document.querySelector('.js-update-profile-container').classList.remove('hidden')
    document.querySelector('.js-upload-file').classList.add('hidden')

    document.querySelector('#js-update-button').addEventListener('click', async () => {
      const name = document.getElementById('username').value || response.name;
      const email = document.getElementById('email').value || response.email;
      const password = document.getElementById('password').value || response.password

      try {
        const updateRequest = await fetch('https://chat-app-remastered.onrender.com/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        })
  
        const updatedUser = await updateRequest.json()
  
        if (updateRequest.status === 200) {
          document.querySelector('.js-user-update-message').classList.remove('hidden')
          setTimeout(() => {
            window.location.reload()
          }, 1000);
        } else {
          document.querySelector('.js-user-update-error-message').classList.remove('hidden')
          setTimeout(() => {
            document.querySelector('.js-user-update-error-message').classList.add('hidden')
          }, timeout);
        } 
      } catch (error) {
        console.log({message: error.message})
      }
    })

    document.querySelector('.js-close-button').addEventListener('click', () => {
      document.querySelector('.js-update-profile-container').classList.add('hidden')
      document.querySelector('.js-upload-file').classList.remove('hidden')
    })
  })
})