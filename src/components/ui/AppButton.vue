<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
})

defineEmits(['click'])

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
  return { type: props.type, disabled: props.disabled }
})
</script>

<template>
  <component
    :is="tag"
    class="appButton"
    :class="{ active, disabled }"
    v-bind="bindings"
    @click="$emit('click', $event)"
  >
    <slot name="icon" />
    <slot />
  </component>
</template>

<style scoped>
.appButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-3);
  color: var(--color-text-3);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.appButton :deep(i) {
  font-size: 1rem;
}

.appButton:hover:not(.disabled) {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.appButton.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.appButton.disabled,
.appButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
