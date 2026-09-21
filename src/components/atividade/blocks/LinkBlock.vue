<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewLink">
    <a :href="block.url" class="linkCard" target="_blank" rel="noopener">
      <div class="linkCardIcon">
        <i class="mdi mdi-link-variant"></i>
      </div>
      <div class="linkCardBody">
        <span class="linkCardLabel">{{ block.label || block.url }}</span>
        <span class="linkCardUrl">{{ block.url }}</span>
        <span v-if="block.desc" class="linkCardDesc">{{ block.desc }}</span>
      </div>
      <i class="mdi mdi-open-in-new linkCardOpen"></i>
    </a>
  </div>
</template>

<style scoped>
.viewLink {
  padding: 0;
  background: transparent;
  border: none;
}

.linkCard {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.linkCard:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.linkCardIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.linkCard:hover .linkCardIcon {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.linkCardBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.linkCardLabel {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkCardUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkCardDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.linkCardOpen {
  font-size: 1.2rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.linkCard:hover .linkCardOpen {
  color: var(--color-navy-accent);
  transform: translate(2px, -2px);
}
</style>
