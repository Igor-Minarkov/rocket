<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/portfolio" class="nav-link">Portfolio</router-link>
      <router-link to="/transactions" class="nav-link"
        >Transactions</router-link
      >
    </nav>
    <div class="app-container">
      <router-view />
    </div>
  </div>
</template>
<style>
/* Global styles for the application */
body {
  font-family: Arial, sans-serif;
  background-color: #f5f6fa;
  margin: 0;
  padding: 0;
}

.container {
  padding: 20px;
  border-radius: 8px;
}

.wrapper {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar {
  background-color: #007bff;
  padding: 15px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-link {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-container {
  padding: 20px;
}

.title {
  text-align: center;
  color: #333;
}

.subtitle {
  color: #4a4a4a;
  margin-top: 20px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
  width: 150px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  border: 1px solid #aaa;
}

.loading,
.error {
  font-style: italic;
  color: #666;
  text-align: center;
}

h2,
h3 {
  color: #4a4a4a;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.error {
  font-style: italic;
  color: #dc3545;
}

.loading {
  font-style: italic;
  color: #6c757d;
}

/* General overwrite for swal cancel */
.swal2-cancel:hover {
  background-color: #b0b0b0 !important;
  color: #fff !important;
}
</style>
