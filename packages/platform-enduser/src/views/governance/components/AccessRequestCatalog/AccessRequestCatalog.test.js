/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import i18n from '@/i18n';
import AccessRequestCatalog from './index';

const mockCatalogItems = [
  {
    appType: 'role',
    icon: '',
    name: 'Roll',
    description: 'A good roll, flakey, warm, yum.',
    templateName: 'template',
    requested: true,
    id: 1,
  },
  {
    appType: 'role',
    icon: '',
    name: 'role 2',
    description: 'A perfect role',
    templateName: 'template2',
    requested: false,
    id: 2,
  },
];

describe('AccessRequestCatalog Component', () => {
  function mountComponent(propsData, overrideData = { selectedTab: 2 }) {
    const wrapper = mount(AccessRequestCatalog, {
      i18n,
      propsData: {
        loading: false,
        ...propsData,
      },
    });
    wrapper.setData(overrideData);
    return wrapper;
  }

  it('displays total count in singular', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 1 });
    await flushPromises();
    const resultsText = wrapper.find('.btn-toolbar .text-muted');

    expect(resultsText.exists()).toBeTruthy();
    expect(resultsText.text()).toEqual('1 Result');
  });

  it('displays total count in plural', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 2 });
    await flushPromises();
    const resultsText = wrapper.find('.btn-toolbar .text-muted');

    expect(resultsText.exists()).toBeTruthy();
    expect(resultsText.text()).toEqual('2 Results');
  });

  it('displays catalog items passed in as props', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: [
          {
            appType: 'role',
            icon: '',
            name: 'Roll',
            description: 'A good roll, flakey, warm, yum.',
          },
          {
            appType: 'role',
            icon: '',
            name: 'role 2',
            description: 'A perfect role',
          },
        ],
      },
    );
    await flushPromises();
    const catalogCards = wrapper.findAll('div.card');

    expect(catalogCards.length).toEqual(2);
  });

  it('does not display pagination if equal to or less than 10 results', () => {
    const wrapper = mountComponent({ totalCount: 10 });
    const paginationComponent = wrapper.find('.pagination-dropdown');

    expect(paginationComponent.exists()).toBeFalsy();
  });

  it('displays pagination if more than 10 results', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 11 });
    await flushPromises();
    const paginationComponent = wrapper.find('.pagination-dropdown');

    expect(paginationComponent.exists()).toBeTruthy();
  });

  it('displays catalog item as requested if it is in the request cart', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockCatalogItems,
      },
    );
    await flushPromises();
    const catalogCards = wrapper.findAll('div.card');
    expect(catalogCards.at(0).find('.card-footer').text()).toBe('check\nAdded');
    expect(catalogCards.at(1).find('.card-footer').text()).toBe('add\nRequest');
  });

  it('emits out event to add request when un-requested item is clicked', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockCatalogItems,
      },
    );
    await flushPromises();
    wrapper.vm.selectedTab = 2;
    const catalogCards = wrapper.findAll('div.card');
    catalogCards.at(1).trigger('click');
    await flushPromises();
    expect(wrapper.emitted()['add-item-to-cart'][0][0]).toEqual({
      itemType: 'role',
      description: 'role',
      templateName: 'template2',
      icon: '',
      name: 'role 2',
      id: 2,
    });
  });

  it('emits out event to remove request when requested item is clicked', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockCatalogItems,
      },
    );
    await flushPromises();
    const catalogCards = wrapper.findAll('div.card');
    catalogCards.at(0).trigger('click');
    expect(wrapper.emitted()['remove-item-from-cart'][0][0]).toEqual(1);
  });
});
