<script setup lang="ts">
// 主题包的 Footer 是原生 <a :href>，不会自动补 base，这里显式包一层
import { withBase } from 'vitepress'

import OssFooter from '@components/oss/Footer.vue'
</script>

<template>
  <OssFooter
    heading="把前端最常见的坑，一次查清"
    subheading="HTML、浏览器、HTTP、JavaScript、TypeScript、主流框架、小程序与工程化实践，全部整理在同一个站点里。"
    button-text="开始阅读"
    :button-link="withBase('/fundamentals/html5/')"
  />
</template>
