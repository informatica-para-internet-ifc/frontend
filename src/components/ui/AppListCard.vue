<script setup>
defineProps({
  to: { type: [String, Object], required: true },
  highlighted: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <div class="listCard" :class="{ highlighted }">
    <RouterLink :to="to" class="listCardLink" @click="$emit('click')">
      <div v-if="$slots.leading" class="listCardLeading">
        <slot name="leading" />
      </div>
      <div class="listCardContent">
        <slot />
      </div>
      <div class="listCardTrailing">
        <slot name="trailing">
          <i class="mdi mdi-chevron-right"></i>
        </slot>
      </div>
    </RouterLink>
    <div v-if="$slots.actions" class="listCardActions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.listCard {
  position: relative;
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.listCard:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.listCard:active {
  transform: translateY(0);
}

.listCard.highlighted {
  border-color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.listCardLink {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  text-decoration: none;
  color: inherit;
  transition: background var(--duration-fast) var(--ease-out);
}

.listCard:hover .listCardLink {
  background: var(--color-surface-3);
}

.listCard.highlighted:hover .listCardLink {
  background: transparent;
}

.listCardLeading {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.listCardContent {
  flex: 1;
  min-width: 0;
}

.listCardTrailing {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: var(--color-text-5);
  transition: color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}

.listCard:hover .listCardTrailing {
  color: var(--color-navy-accent);
  transform: translateX(3px);
}

.listCardActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-6) var(--sp-4);
}

@media (max-width: 640px) {
  .listCardLink {
    padding: var(--sp-4);
  }
}
</style>
