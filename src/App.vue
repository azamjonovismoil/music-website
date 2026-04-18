<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  font-family: Inter, Arial, sans-serif;
  background: #0a0d14;
  color: #fff;
}

* {
  box-sizing: border-box;
}

a {
  text-decoration: none;
}
</style>