<template>
  <div class="dashboard">
    <h2>Welcome, {{ username }}!</h2>
    <p>This is your dashboard. You are logged in.</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: localStorage.getItem('username') || 'User'
    };
  },
  methods: {
    async logout() {
      try {
        await axios.post('http://127.0.0.1:8000/api/logout/', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // Clear tokens from local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');

        // Redirect to the login page
        this.$router.push('/');
      } catch (error) {
        console.error('Logout failed:', error.response.data);
      }
    }
  },
  created() {
    // You'll add logic here later to protect this page
  }
};
</script>

<style scoped>
.dashboard {
  text-align: center;
  margin-top: 50px;
}
</style>