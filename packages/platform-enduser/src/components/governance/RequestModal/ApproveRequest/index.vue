<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-25">
    {{ subtitle() }}
  </div>
</template>

<script>

export default {
  name: 'ApproveRequest',
  components: { },
  methods: {
    subtitle() {
      return this.$t('governance.requestModal.subtitle', { modal: this.$t('common.approve').toLowerCase() });
    },
  },
};
</script>
<style scoped>
  .p-25 {
    padding-bottom: 25px;
  }
</style>
