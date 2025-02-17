/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import AccessRequestList from './index';

const application = {
  id: 1,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'applicationGrant',
  application: {
    name: 'test application',
    description: 'test description',
  },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
};

const entitlement = {
  id: 2,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'entitlementGrant',
  application: {},
  entitlement: {
    displayName: 'test entitlement',
    description: 'test description',
  },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
};

const role = {
  id: 3,
  decision: {
    startDate: '2023-06-22T19:23:26+00:00',
  },
  request: {
    common: {
      priority: '',
    },
  },
  requestType: 'roleGrant',
  role: {
    name: 'test role',
    description: 'test description',
  },
  user: {
    givenName: 'test givenName',
    sn: 'test sn',
  },
};

describe('AccessReviews', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(AccessRequestList, {
      mocks: {
        $t: (text, params) => {
          if (text === 'governance.accessRequest.idLabel') {
            return text + params.id;
          }
          return text;
        },
      },
      propsData: {
        requests: [
          application,
        ],
      },
    });
  });

  describe(('applications'), () => {
    it('should display request types', async () => {
      const app = cloneDeep(application);
      await wrapper.setProps({
        requests: [
          app,
        ],
      });

      let requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Grant Application');

      app.requestType = 'applicationRevoke';

      await wrapper.setProps({
        requests: [
          app,
        ],
      });

      requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Remove Application');
    });

    it('should display application name', () => {
      wrapper.setProps({
        requests: [
          application,
        ],
      });

      const requestName = findByTestId(wrapper, 'request-item-name');
      expect(requestName.text()).toBe('test application');
    });

    it('should display application description', () => {
      wrapper.setProps({
        requests: [
          application,
        ],
      });

      const requestDescription = findByTestId(wrapper, 'request-item-description');
      expect(requestDescription.text()).toBe('test description');
    });
  });

  describe(('entitlements'), () => {
    it('should display request types', async () => {
      const ent = cloneDeep(entitlement);
      await wrapper.setProps({
        requests: [
          ent,
        ],
      });

      let requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Grant Entitlement');

      ent.requestType = 'entitlementRevoke';

      await wrapper.setProps({
        requests: [
          ent,
        ],
      });

      requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Remove Entitlement');
    });

    it('should display entitlement name', async () => {
      await wrapper.setProps({
        requests: [
          entitlement,
        ],
      });

      const requestName = findByTestId(wrapper, 'request-item-name');
      expect(requestName.text()).toBe('test entitlement');
    });

    it('should display entitlement description', () => {
      wrapper.setProps({
        requests: [
          entitlement,
        ],
      });

      const requestDescription = findByTestId(wrapper, 'request-item-description');
      expect(requestDescription.text()).toBe('test description');
    });
  });

  describe(('roles'), () => {
    it('should display request types', async () => {
      const myRole = cloneDeep(role);
      await wrapper.setProps({
        requests: [
          myRole,
        ],
      });

      let requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Grant Role');

      myRole.requestType = 'roleRevoke';

      await wrapper.setProps({
        requests: [
          myRole,
        ],
      });

      requestType = findByTestId(wrapper, 'request-type');
      expect(requestType.text()).toBe('Remove Role');
    });

    it('should display role name', async () => {
      await wrapper.setProps({
        requests: [
          role,
        ],
      });

      const requestName = findByTestId(wrapper, 'request-item-name');
      expect(requestName.text()).toBe('test role');
    });

    it('should display role description', () => {
      wrapper.setProps({
        requests: [
          role,
        ],
      });

      const requestDescription = findByTestId(wrapper, 'request-item-description');
      expect(requestDescription.text()).toBe('test description');
    });
  });

  it('should show who access has been requested for', () => {
    const user = findByTestId(wrapper, 'request-item-user');
    expect(user.text()).toBe('test givenName test sn');
  });

  it('should show the date the request was created', () => {
    const date = findByTestId(wrapper, 'request-item-date');
    expect(date.text()).toBe('Jun 22, 2023');
  });

  it('should show the request id', () => {
    const id = findByTestId(wrapper, 'request-item-id');
    expect(id.text()).toBe('governance.accessRequest.idLabel1');
  });
});
