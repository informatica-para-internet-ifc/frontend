<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  desc: String,
  small: Boolean,
  grow: Boolean,
})

defineEmits(['click'])
</script>

<template>
  <RouterLink
    to="/"
    class="brand"
    :class="{ small, grow }"
    @click="$emit('click')"
  >
    <div class="brandIcon" :class="{ small }">
      <img src="@/assets/img/logo/logo-sem-borda.svg" alt="Logo" class="brandImg" />
    </div>
    <div class="brandText">
      <span class="brandName">
        <span class="brandPrimary">Info</span><span class="brandSecondary">Internet</span>
      </span>
      <span v-if="desc" class="brandDesc">{{ props.desc }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  text-decoration: none;
  transition: transform 0.4s var(--ease-out);
}

.brand:hover {
  transform: translateY(-2px);
}

.brand.small { gap: var(--sp-2); }
.brand.grow { flex: 1; justify-content: flex-start; }

/* ── Icon ── */
.brandIcon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brandImg {
  width: 36px;
  height: 36px;
  display: block;
  filter: var(--color-logo-filter, none);
  transition: transform 0.4s var(--ease-out), filter 0.4s var(--ease-out);
}

.brand:hover .brandImg {
  transform: scale(1.08);
  filter: var(--color-logo-filter, none) drop-shadow(0 0 14px var(--color-navy-accent-muted));
}

.brandIcon.small .brandImg {
  width: 32px;
  height: 32px;
}

/* ── Text ── */
.brandText {
  display: flex;
  flex-direction: column;
}

.brandName {
  font-size: var(--text-md);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: 1.2;
}

.brand.small .brandName { font-size: var(--text-base); }

.brandPrimary {
  color: var(--color-text-1);
  transition: color 0.4s var(--ease-out);
}

.brand:hover .brandPrimary {
  color: var(--color-navy-accent);
}

.brandSecondary {
  color: var(--color-text-3);
  font-weight: 500;
  transition: color 0.4s var(--ease-out);
}

.brand:hover .brandSecondary {
  color: var(--color-text-2);
}

.brandDesc {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  line-height: 1.2;
  transition: color 0.4s var(--ease-out);
}

.brand:hover .brandDesc {
  color: var(--color-text-4);
}
</style>
