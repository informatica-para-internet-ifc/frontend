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
      <span class="brandImg" role="img" aria-label="Logo"></span>
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
  background-color: var(--color-navy-accent);
  -webkit-mask-image: url('@/assets/img/logo/logo.svg');
  mask-image: url('@/assets/img/logo/logo.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  transition: transform 0.4s var(--ease-out), background-color 0.4s var(--ease-out);
}

.brand:hover .brandImg {
  transform: scale(1.05);
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
  color: var(--color-navy-accent);
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
