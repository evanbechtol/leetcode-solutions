<script setup lang="ts">
import type { LessonDiagramNode } from '../data/lessons'

defineOptions({ name: 'TreeDiagramNode' })
defineProps<{ node: LessonDiagramNode }>()
</script>

<template>
  <div class="tree-diagram-branch">
    <div class="tree-diagram-node" :class="`tree-node-${node.role}`">
      <strong>{{ node.value }}</strong>
      <small>{{ node.role }}</small>
    </div>
    <div v-if="node.children?.length" class="tree-diagram-children">
      <TreeDiagramNode v-for="child in node.children" :key="child.value" :node="child" />
    </div>
  </div>
</template>
