<script setup>
import { useIsMobileStore } from '../../../stores/isMobile.js'
import AppHeaderDesktop from './AppHeaderDesktop.vue'
import AppHeaderMobile from './AppHeaderMobile.vue'

const isMobile = useIsMobileStore()
</script>

<template>
  <AppHeaderDesktop v-if="!isMobile.isMobile" />
  <AppHeaderMobile v-else />
</template>
