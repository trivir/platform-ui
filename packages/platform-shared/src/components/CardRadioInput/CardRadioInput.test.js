/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CardRadioInput from './index';

describe('CardRadioInput Component', () => {
  let wrapper;

  it('uses a card containing value text by default', () => {
    wrapper = shallowMount(CardRadioInput, {
      propsData: {
        radioValue: 'test',
      },
    });
    expect(wrapper.find('bcard-stub').exists()).toBe(true);
    expect(wrapper.find('bcard-stub').text()).toEqual('test');
  });

  it('default slot will allow for custom content within card', () => {
    wrapper = shallowMount(CardRadioInput, {
      propsData: {
        radioValue: 'test',
      },
      slots: {
        default: '<code></code>',
      },
    });
    expect(wrapper.find('bcard-stub').exists()).toBe(true);
    expect(wrapper.text()).toEqual('');
    expect(wrapper.find('code').exists()).toBe(true);
  });
});
