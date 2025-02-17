/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { ValidationProvider } from 'vee-validate';
import ListOfObjects from './index';

const stubs = { ValidationProvider };
const wrapperNoValue = {
  mocks: { $t: () => {} },
  propsData: {
    properties: {
      testPropertyKey: {
        type: 'boolean',
        title: 'testPropertyValue',
      },
      test: {
        type: 'string',
        title: 'test',
      },
    },
    label: 'test',
  },
  stubs,
};

describe('ListOfObjects', () => {
  it('ListOfObjects sets listValues when there is an array value', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: { $t: () => {} },
      propsData: {
        properties: {
          testPropertyKey: {
            type: 'boolean',
            title: 'testPropertyValue',
          },
          test: {
            type: 'string',
            title: 'test',
          },
        },
        label: 'test',
        value: [{ test: 'test' }],
      },
      stubs,
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: 'test',
    }]);
  });

  it('ListOfObjects sets listValues and converts to array when there is an object value', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: { $t: () => {} },
      propsData: {
        properties: {
          testPropertyKey: {
            type: 'boolean',
            title: 'testPropertyValue',
          },
          test: {
            type: 'string',
            title: 'test',
          },
        },
        label: 'test',
        multiValued: false,
        value: { test: 'test' },
      },
      stubs,
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: 'test',
    }]);
  });

  it('ListOfObjects adds empty elements to list', () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);

    wrapper.vm.addObjectToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }]);
  });

  it('ListOfObjects removes elements from list', () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);
    wrapper.vm.$data.listValues = [{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }];

    wrapper.vm.removeElementFromList(0);
    expect(wrapper.vm.listValues).toStrictEqual([]);
  });

  it('ListOfObjects checks if field is valid', async () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: { $t: () => {} },
      propsData: {
        properties: {
          testPropertyKey: {
            type: 'array',
            title: 'testPropertyKey',
          },
        },
        label: 'test',
      },
      stubs,
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    await wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'object',
          title: 'testPropertyKey',
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    await wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'other',
          title: 'testPropertyKey',
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(true);
  });

  it('Add button disabled if field is disabled', async () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);
    await wrapper.setProps({ disabled: true });

    const addButton = findByTestId(wrapper, 'list-objects-none-add');
    expect(addButton.attributes('disabled')).toBeTruthy();
  });

  it('If all fields are empty or null, remove the object', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: { $t: () => {} },
      propsData: {
        label: 'test',
        properties: {
          test: {
            type: 'string',
            title: 'test',
          },
          testtwo: {
            type: 'string',
            title: 'testtwo',
          },
        },
      },
      stubs,
    });
    const emptyObj = [{ test: '', testtwo: null }];
    wrapper.vm.emitInput(emptyObj);
    expect(wrapper.emitted().input[0]).toEqual([[]]);
  });
});
