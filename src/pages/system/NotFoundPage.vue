<template>

  <section class="not-found">

    <div class="not-found__card">

      <h1>404</h1>

      <p>Page not found.</p>

      <RouterLink class="not-found__link" to="/">Go home</RouterLink>

    </div>

  </section>

</template>

<style scoped>
.not-found {

  min-height: 100vh;

  display: grid;

  place-items: center;

  padding: 20px;

}

.not-found__card {

  width: 100%;

  max-width: 420px;

  padding: 28px;

  text-align: center;

  border-radius: 28px;

  background: #15151d;

  border: 1px solid rgba(255, 255, 255, .08);

  color: #fff;

}

.not-found__card h1 {

  font-size: 54px;

  font-weight: 900;

}

.not-found__link {

  display: inline-flex;

  margin-top: 16px;

  color: #fff;

  text-decoration: none;

  background: linear-gradient(135deg, #ff2ea6, #a855f7);

  padding: 12px 16px;

  border-radius: 14px;

}
</style>