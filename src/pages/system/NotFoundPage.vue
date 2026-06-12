<template>
  <section class="not-found">
    <div class="not-found__card">
      <div class="not-found__eyebrow">Lost in playback</div>
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
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 26%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.06), transparent 20%),
    var(--bg-base);
}

.not-found__card {
  width: 100%;
  max-width: 440px;
  padding: 32px 24px;
  text-align: center;
  border-radius: 28px;
  background: color-mix(in srgb, var(--surface-1) 98%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.not-found__eyebrow {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.not-found__card h1 {
  margin-top: 12px;
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.not-found__card p {
  margin-top: 10px;
  color: var(--text-muted);
  line-height: 1.6;
}

.not-found__link {
  display: inline-flex;
  margin-top: 18px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(53, 109, 255, 0.24);
}
</style>  