/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Router from 'vue-router';
import { every } from 'lodash';
import Vue from 'vue';
import i18n from './i18n';

import store from '@/store';

Vue.use(Router);

function checkIfRouteCanBeAccessed(next, requiredFlags = [], onFailRoute = { name: 'NotFound' }) {
  if (!requiredFlags.length || every(requiredFlags, (flag) => flag)) {
    next();
  } else {
    next(onFailRoute);
  }
}

/**
 * Available configuration
 * hideSideMenu - Will hide left-hand navigation when route accessed
 * hideNavBar - Will hide top toolbar when route accessed
 */
const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/risk-dashboard',
      name: 'RiskDashboard',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/Activity'),
    },
    {
      path: '/autoaccess/data-sources',
      name: 'AutoAccessDataSources',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/DataSources'),
    },
    {
      path: '/autoaccess/pipelines',
      name: 'AutoAccessPipelines',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/Pipelines'),
    },
    {
      path: '/autoaccess/risk-config',
      name: 'AutoAccessRiskConfig',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/RiskConfig'),
    },
    {
      path: '/handleOAuth/:amData',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideSideMenu: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/oauthReturn',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideSideMenu: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/profile',
      name: 'Profile',
      props: true,
      component: () => import('@/components/profile'),
      meta: { authenticate: true },
    },
    {
      path: '/approvals',
      name: 'Approvals',
      component: () => import('@/views/governance/Approvals'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/access-reviews',
      name: 'AccessReviews',
      component: () => import('@/views/governance/AccessReviews'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-requests',
      name: 'MyRequests',
      component: () => import(/* webpackChunkName: "MyRequests" */ '@/views/governance/accessRequest/MyRequests'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-requests/new-request',
      name: 'AccessRequestNew',
      component: () => import(/* webpackChunkName: "AccessRequestNew" */ '@/views/governance/accessRequest/NewRequest'),
      meta: { hideNavBar: true, hideSideMenu: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled, to.params.requestingFor], { path: '/my-requests' }),
    },
    {
      path: '/certification/certification-task/:campaignId',
      name: 'CertificationTask',
      component: () => import('@forgerock/platform-shared/src/views/Governance/CertificationTask'),
      meta: { hideNavBar: true, hideSideMenu: true },
    },
    {
      path: '/applications',
      name: 'Applications',
      component: () => import('@/views/WorkforceApplications'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.workforceEnabled]),
    },
    {
      path: '/my-delegates',
      name: 'Delegates',
      component: () => import('@/views/governance/Directory/Delegates'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-reports',
      name: 'DirectReports',
      component: () => import('@/views/governance/Directory/DirectReports'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-reports/:userId/:grantType',
      name: 'DirectReportDetail',
      component: () => import('@/views/governance/Directory/DirectReportDetail'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/list/:resourceType/:resourceName',
      name: 'ListResource',
      component: () => import(/* webpackChunkName: "listResource" */ '@/views/ListResourceView'),
      meta: { columns: true, authenticate: true },
    },
    {
      path: '/edit/:resourceType/:resourceName/:resourceId',
      name: 'EditResource',
      component: () => import('@/views/EditResourceView'),
      meta: { authenticate: true, listRoute: 'list' },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardManager'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => {
        if (window.location.search && window.location.search.match(/state|oauth_token/)) {
          next({
            path: '/oauthReturn',
          });
        } else {
          next();
        }
      },
    },
    {
      path: '/my-accounts',
      name: 'Accounts',
      component: () => import('@/views/governance/MyAccessReview/Accounts'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-entitlements',
      name: 'Entitlements',
      component: () => import('@/views/governance/MyAccessReview/Entitlements'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-roles',
      name: 'Roles',
      component: () => import('@/views/governance/MyAccessReview/Roles'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/sharing',
      name: 'Sharing',
      component: () => import('@/components/uma'),
      meta: {
        authenticate: true,
      },
    },
    {
      path: '/auth-devices',
      component: () => import('@forgerock/platform-shared/src/components/profile/AuthenticationDevices'),
      meta: {
        authenticate: true,
        hideSideMenu: true,
      },
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import(/* webpackChunkName: "forbidden" */ '@/components/forbidden'),
    },
    {
      path: '*',
      name: 'NotFound',
      component: () => import('@forgerock/platform-shared/src/views/NotFound'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const page = to.name ? i18n.t(`pageTitles.${to.name}`) : '';
  document.title = i18n.t('pageTitles.pageTitle', { page });
  const url = new URL(window.location);
  const realm = url.searchParams.get('realm');

  if (store.state.hostedPages === false && to.name !== 'Forbidden') {
    next({ name: 'Forbidden' });
  } else if (realm !== store.state.realm) {
    // If there is no realm defined here it means the realm is root and no realm url
    // param is defined or a custom domain is being used. In both cases we do not need
    // (or want in the case of custom domain) to add the realm parameter.
    if (realm) {
      url.searchParams.set('realm', store.state.realm);
      window.location = encodeURI(url);
    }
    next();
  } else {
    next();
  }
});

export default router;
