<!-- Copyright 2020-2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BCard
    v-if="card"
    :body-class="bodyClass">
    <div
      class="fr-no-data text-center"
      :data-testid="testid">
      <FrIcon
        :class="`fr-no-data-icon md-72 text-center text-secondary opacity-20 my-4 ${iconClasses}`"
        :name="this.icon" />
      <h1 class="h4">
        {{ this.title }}
      </h1>
      <p>
        {{ this.subtitle }}
      </p>
      <slot />
    </div>
  </BCard>
  <div
    v-else
    class="fr-no-data text-center"
    :data-testid="testid">
    <FrIcon
      :class="`fr-no-data-icon text-center md-96 text-secondary opacity-20 my-4 ${iconClasses}`"
      :name="this.icon" />
    <h1 class="h2">
      {{ this.title }}
    </h1>
    <p>
      {{ this.subtitle }}
    </p>
    <slot />
  </div>
</template>

<script>
import {
  BCard,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
/**
 * Generic no data state that contains both a card and none card display
 */
export default {
  name: 'NoData',
  components: {
    BCard,
    FrIcon,
  },
  props: {
    bodyClass: {
      type: String,
      default: '',
    },
    card: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'bug_report',
    },
    iconClasses: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    testid: {
      type: String,
      default: '',
    },
  },
};
</script>
