/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';
import RequestCart from './index';

jest.mock('@/components/utils/governance/AccessRequestUtils');

describe('RequestCart', () => {
  const requestCartUsersStub = [
    {
      name: 'Barbara Jensen',
      username: 'bjensen',
      imgSrc: 'https://i.postimg.cc/hGrT2507/user-18-7d4c7a13.png',
    },
    {
      name: 'Pac Man',
      username: 'pman',
      imgSrc: 'http://google.com/pacman',
    },
  ];

  const requestCartItemsStub = [{
    itemType: 'entitlement',
    name: 'Application Architecture Director',
    description: 'Salesforce Permission Set',
    imgSrc: 'url/to/img',
  }];

  const stubProps = {
    i18n,
    propsData: {
      requestCartUsers: [{
        name: 'Barbara Jensen',
        username: 'bjensen',
        imgSrc: 'https://i.postimg.cc/hGrT2507/user-18-7d4c7a13.png',
      }],
    },
  };

  const setup = (props) => (mount(RequestCart, {
    ...stubProps,
    ...props,
  }));

  beforeEach(() => {
    getPriorityImageSrc.mockClear();
  });

  describe('@Component Tests', () => {
    it('disables the submit button if no requested items present', () => {
      const wrapper = setup();
      const submitButton = findByTestId(wrapper, 'submit-request-button');
      expect(submitButton.element.disabled).toBeTruthy();
    });

    it('emits "remove-requested-user" event when form is submitted with the expected payload', async () => {
      const wrapper = setup({
        propsData: {
          requestCartUsers: requestCartUsersStub,
          requestCartItems: requestCartItemsStub,
        },
      });
      const submitButton = findByTestId(wrapper, 'submit-request-button');
      await submitButton.trigger('click');
      expect(wrapper.emitted('submit-new-request')).toEqual([[{
        accessModifier: 'add',
        priority: 'low',
      }]]);
    });
  });
});
