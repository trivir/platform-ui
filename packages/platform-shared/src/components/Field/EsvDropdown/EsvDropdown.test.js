/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EsvDropdown from './index';
import i18n from '@/i18n';

const defaultProps = {
  fieldType: 'checkbox',
};

const inputStoreData = {
  variables: [
    {
      expressionType: 'bool',
      placeholder: '&{esv.myBool}',
    },
    {
      expressionType: 'bool',
      placeholder: '&{esv.yourBool}',
    },
    {
      expressionType: 'string',
      placeholder: '&{esv.myString}',
    },
  ],
};

describe('EsvDropdown', () => {
  function setup(props) {
    return mount(EsvDropdown, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              esvInput: inputStoreData,
            },
          }),
        ],
      },
      i18n,
      attachTo: document.body,
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  it('displays a heading, search bar and relevant ESVs in the dropdown list', async () => {
    const wrapper = setup();

    const dropdownButton = wrapper.find('button');
    dropdownButton.trigger('click');

    expect(wrapper.findAll('li').length).toBe(4);
    const items = wrapper.findAll('li');

    expect(items.at(0).text()).toBe('Variables');
    expect(items.at(1).text()).toBe('search');
    expect(items.at(2).text()).toBe('&{esv.myBool}');
    expect(items.at(3).text()).toBe('&{esv.yourBool}');
  });

  it('Filters ESVs based on the query', async () => {
    const wrapper = setup();

    const dropdownButton = wrapper.find('button');
    dropdownButton.trigger('click');

    const items = wrapper.findAll('li');
    const searchInput = items.at(1).find('input');
    await searchInput.setValue('your');

    expect(wrapper.findAll('li').length).toBe(3);
    expect(wrapper.findAll('li').at(2).text()).toBe('&{esv.yourBool}');
  });

  it('Shows no variables when a query with no matches is entered', async () => {
    const wrapper = setup();

    const dropdownButton = wrapper.find('button');
    dropdownButton.trigger('click');

    const items = wrapper.findAll('li');
    const searchInput = items.at(1).find('input');
    await searchInput.setValue('zzz');

    expect(wrapper.findAll('li').length).toBe(3);
    expect(wrapper.findAll('li').at(2).text()).toBe('No variables found');
  });

  it('emits esv-selected when an item is clicked', async () => {
    const wrapper = setup();

    expect(wrapper.emitted('esv-selected')).toBeUndefined();

    const dropdownButton = wrapper.find('button');
    dropdownButton.trigger('click');

    const items = wrapper.findAll('li');
    await items.at(2).find('a').trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('esv-selected')).toBeDefined();
    expect(wrapper.emitted('esv-selected')[0][0]).toBe('&{esv.myBool}');
  });
});
