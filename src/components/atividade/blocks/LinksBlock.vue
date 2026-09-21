<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewLinks">
    <div class="extLinksList">
      <a
        v-for="(lk, li) in block.links.filter((l) => l.title || l.url)"
        :key="li"
        :href="lk.url"
        class="extLink"
        target="_blank"
        rel="noopener"
      >
        <div class="extLinkIcon">
          <i class="mdi mdi-link-variant"></i>
        </div>
        <div class="extLinkBody">
          <span class="extLinkTitle">{{ lk.title || lk.url }}</span>
          <span v-if="lk.desc" class="extLinkDesc">{{ lk.desc }}</span>
          <span class="extLinkUrl">{{ lk.url }}</span>
        </div>
        <i class="mdi mdi-open-in-new extLinkOpen"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
.viewLinks {
  padding: 0;
  background: transparent;
  border: none;
}

.extLinksList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.extLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.extLink:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.extLinkIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.extLink:hover .extLinkIcon {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.extLinkBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.extLinkTitle {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.extLinkDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.extLinkUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.extLinkOpen {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.extLink:hover .extLinkOpen {
  color: var(--color-navy-accent);
  transform: translate(2px, -2px);
}
</style>
