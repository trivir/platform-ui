/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount } from '@vue/test-utils';
import { findByTestId, createTooltipContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import { cloneDeep } from 'lodash';
import flushPromises from 'flush-promises';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import CertificationTaskList from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;
let $emit;
const resourceDataMock = {
  data: {
    result: [],
    totalCount: 2,
  },
};

function shallowMountComponent(options = {}, data = {}, propsData = {}) {
  $emit = jest.fn();
  wrapper = shallowMount(CertificationTaskList, {
    mocks: {
      $t: (t) => t,
      $emit,
      $root: {
        $emit,
      },
      ...options,
    },
    data() {
      return {
        ...data,
      };
    },
    propsData: {
      campaignId: 'test-id',
      campaignDetails: {},
      ...propsData,
    },
  });
}

function mountComponent(propsData = {}) {
  createTooltipContainer(['btnCertify-test-id-0', 'btnRevoke-test-id-0', 'btnAllowException-test-id-0']);
  wrapper = mount(CertificationTaskList, {
    attachTo: document.body,
    mocks: {
      $t: (t) => t,
      $store: {
        state: {
          UserStore: {
            userId: 'testId',
          },
        },
      },
    },
    stubs: ['BTooltip'],
    propsData: {
      campaignDetails: {},
      ...propsData,
    },
  });
}

describe('CertificationTaskList', () => {
  beforeEach(() => {
    CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.certifyCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.revokeCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.exceptionCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.getCertificationTaskAccountDetails.mockImplementation(() => Promise.resolve({}));
    CertificationApi.saveComment.mockImplementation(() => Promise.resolve({}));
    CertificationApi.reassignLineItem.mockImplementation(() => Promise.resolve({}));
    CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.resolve({}));
    CertificationApi.getUserDetails.mockImplementation(() => Promise.resolve({ data: { results: [] } }));
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockImplementation(() => Promise.resolve({ data: {} }));
  });

  describe('Account column display', () => {
    beforeEach(() => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              id: 'testId',
              user: {},
              account: {},
              application: {},
              entitlement: {},
              decision: {
                certification: {},
              },
              permissions: {},
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'entitlement name',
                  },
                  '/account': {
                    displayName: 'account name',
                  },
                },
              },
            },
          ],
        },
      }));
    });

    it('shows descriptor.idx./account property in table', async () => {
      mountComponent();
      await flushPromises();

      const account = findByTestId(wrapper, 'account-cell');
      expect(account.text()).toBe('account name');
    });

    it('shows descriptor.idx./entitlement property in table', async () => {
      mountComponent({
        showEntitlementColumn: true,
      });
      await flushPromises();

      const entitlement = findByTestId(wrapper, 'entitlement-cell');
      expect(entitlement.text()).toBe('entitlement name');
    });
  });

  describe('paginationChange', () => {
    it('should call getCertificationTaskList with the pagination page', async () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getCertificationTaskList');
      await flushPromises();
      wrapper.vm.paginationPage = 1;
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });

  describe('openCertificationTaskSortModal', () => {
    it('should emit the bv::show::modal to show the certification task sort', () => {
      wrapper.vm.openCertificationTaskSortModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskSortConfirmAccountModal');
    });
  });
  describe('isTaskSelected', () => {
    it('should return true if the allSelected variable is true', () => {
      wrapper.vm.allSelected = true;
      const result = wrapper.vm.isTaskSelected('test');
      expect(result).toEqual(true);
    });
    it('should return false if the allSelected variable is false and there is no selected tasks', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedTasks = [];
      const result = wrapper.vm.isTaskSelected('test');
      expect(result).toEqual(false);
    });
    it('should return true if the task id is selected', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedTasks = ['test-id'];
      const result = wrapper.vm.isTaskSelected('test-id');
      expect(result).toEqual(true);
    });
  });
  describe('loadTasksList', () => {
    it('should set the total rows with the total hits', () => {
      wrapper.vm.loadTasksList(resourceDataMock);
      expect(wrapper.vm.totalRows).toEqual(2);
    });
    it('should set the current page with the page param', () => {
      wrapper.vm.loadTasksList(resourceDataMock, 1);
      expect(wrapper.vm.currentPage).toEqual(1);
    });
    it('should set the tasks data with the mapped data with selected property', () => {
      shallowMountComponent();
      wrapper.vm.selectedTasks = ['test-id'];
      const resource = {
        data: {
          result: [{
            id: 'test-id',
          }],
        },
      };
      const expectedValue = [{
        id: 'test-id',
        selected: true,
        isRoleBasedGrant: false,
        flags: [
          'NEW_ACCESS',
        ],
      }];
      wrapper.vm.loadTasksList(resource, 1);
      expect(wrapper.vm.tasksData).toEqual(expectedValue);
    });
    it('should add flags to item', () => {
      shallowMountComponent({}, {});
      const resource = {
        data: {
          result: [{}],
        },
      };
      wrapper.vm.loadTasksList(resource, 1);
      expect(wrapper.vm.tasksData[0].flags).toEqual(['NEW_ACCESS']);
    });
    it('should emit check-progress if there is a task in status', () => {
      shallowMountComponent();
      const resource = {
        data: {
          result: [{
            decision: {
              certification: {
                status: 'signed-off',
              },
            },
            id: 'test-id',
          }],
        },
      };
      wrapper.vm.loadTasksList(resource, 1);
      expect($emit).toBeCalledWith('check-progress');
    });
    it('should show noData component when there are no templates', async () => {
      wrapper.vm.loadTasksList({ data: { result: [], totalHits: 0 } }, 0);
      await flushPromises();

      const noData = findByTestId(wrapper, 'cert-task-list-no-data');
      expect(noData.exists()).toBeTruthy();
    });
  });
  describe('getCertificationTaskList', () => {
    let loadTasksListSpy;
    let buildUrlParamsSpy;

    beforeEach(() => {
      shallowMountComponent({}, {
        currentPage: 2,
        sortBy: 'name',
        sortDir: 'asc',
      });
      loadTasksListSpy = jest.spyOn(wrapper.vm, 'loadTasksList');
      buildUrlParamsSpy = jest.spyOn(wrapper.vm, 'buildUrlParams');
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadTasksList once the result of the call is ready', async () => {
      wrapper.vm.getCertificationTaskList(2);

      await flushPromises();
      expect(loadTasksListSpy).toHaveBeenCalled();
    });
    it('should call buildUrlParams with the required params', () => {
      wrapper.vm.getCertificationTaskList(2);
      expect(buildUrlParamsSpy).toHaveBeenCalledWith(2, 'name', 'asc');
    });
    it('should call getCertificationTasksListByCampaign with the required params', () => {
      wrapper.vm.getCertificationTaskList(2);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
    });
  });
  describe('buildUrlParams', () => {
    it('should return the urlParams according to the params', () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        taskStatus: 'active',
      };
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
    it('should return the urlParams according to the params when isAdmin', async () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        isAdmin: true,
        actorId: '123',
        taskStatus: 'active',
      };
      await wrapper.setProps({
        isAdmin: true,
        actorId: '123',
      });
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
    it('should not return task status if task status is staging', async () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        isAdmin: true,
        actorId: '123',
      };
      await wrapper.setProps({
        isAdmin: true,
        actorId: '123',
        taskStatus: 'staging',
      });
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('getBaseFilters', () => {
    it('should return the base filters to load the list', () => {
      shallowMountComponent();
      const expectedValue = [{
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.certification.actors.id',
          targetValue: '',
        },
      }];
      const result = wrapper.vm.getBaseFilters();
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('buildBodyParams', () => {
    describe('admin', () => {
      it('should return the base filters to load the list when there is no filters', async () => {
        shallowMountComponent();
        await wrapper.setProps({ isAdmin: true });
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [{
              operand: {
                targetName: 'decision.certification.primaryReviewer.id',
                targetValue: '',
              },
              operator: 'EQUALS',
            }],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });

      it('should return the base filters to load the list when there are filters', async () => {
        shallowMountComponent();
        await wrapper.setProps({ isAdmin: true });
        wrapper.vm.listFilters = {
          user: 'useris',
          application: 'appid',
          decision: ['certify'],
        };
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [
              {
                operator: 'AND',
                operand: [
                  {
                    operator: 'IN',
                    operand: {
                      targetName: 'decision.certification.decision',
                      targetValue: [
                        'certify',
                      ],
                    },
                  },
                  {
                    operator: 'EQUALS',
                    operand: {
                      targetName: 'application.id',
                      targetValue: 'appid',
                    },
                  },
                  {
                    operator: 'EQUALS',
                    operand: {
                      targetName: 'user.id',
                      targetValue: 'useris',
                    },
                  },
                ],
              },
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'decision.certification.primaryReviewer.id',
                  targetValue: '',
                },
              },
            ],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });
    });

    describe('enduser', () => {
      it('should return the base filters to load the list when there is no filters', () => {
        shallowMountComponent();
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [{
              operand: {
                targetName: 'decision.certification.actors.id',
                targetValue: '',
              },
              operator: 'EQUALS',
            }],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });

      it('should return the base filters to load the list when there are filters', () => {
        shallowMountComponent();
        wrapper.vm.listFilters = {
          user: 'useris',
          application: 'appid',
          decision: ['certify'],
        };
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [
              {
                operator: 'AND',
                operand: [
                  {
                    operator: 'IN',
                    operand: {
                      targetName: 'decision.certification.decision',
                      targetValue: [
                        'certify',
                      ],
                    },
                  },
                  {
                    operator: 'EQUALS',
                    operand: {
                      targetName: 'application.id',
                      targetValue: 'appid',
                    },
                  },
                  {
                    operator: 'EQUALS',
                    operand: {
                      targetName: 'user.id',
                      targetValue: 'useris',
                    },
                  },
                ],
              },
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'decision.certification.actors.id',
                  targetValue: '',
                },
              },
            ],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });
    });
  });
  describe('selectTask', () => {
    const resource = [{
      id: 'test-id',
    },
    {
      id: 'test-id-2',
    }];
    it('should return the task list with all selected tasks', () => {
      const expectedValue = [{
        id: 'test-id',
        selected: true,
      },
      {
        id: 'test-id-2',
        selected: true,
      }];
      wrapper.vm.tasksData = resource;
      wrapper.vm.selectTask(true, true);
      expect(wrapper.vm.tasksData).toStrictEqual(expectedValue);
    });
    it('should return the task list with all task in selected false', () => {
      const expectedValue = [{
        id: 'test-id',
        selected: false,
      },
      {
        id: 'test-id-2',
        selected: false,
      }];
      wrapper.vm.tasksData = resource;
      wrapper.vm.selectTask(false);
      expect(wrapper.vm.tasksData).toStrictEqual(expectedValue);
    });
  });
  describe('updateCertificationTaskList', () => {
    it('should call display notification with the success message', () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      wrapper.vm.updateCertificationTaskList();
      expect(displayNotificationSpy).toBeCalledWith('success', 'governance.certificationTask.success.undefined');
    });
    it('should set the selected task to empty', () => {
      wrapper.vm.updateCertificationTaskList();
      expect(wrapper.vm.selectedTasks).toEqual([]);
    });
    it('should call getCertificationTaskList with the main page', () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getCertificationTaskList');
      wrapper.vm.mainPageNumber = 1;
      wrapper.vm.updateCertificationTaskList();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });
  describe('filterCertificationItems', () => {
    it('should call getCertificationTaskList with the paginationPage', () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getCertificationTaskList');
      wrapper.vm.paginationPage = 1;
      wrapper.vm.filterCertificationItems({ decision: ['noDecision'] });
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
    it('listFilters should contain the new filters', () => {
      shallowMountComponent();
      const filterTest = {
        decision: ['certify'],
      };
      wrapper.vm.filterCertificationItems(filterTest);
      expect(wrapper.vm.listFilters).toEqual({ ...filterTest });
    });
  });

  describe('saveCertifyBulkAction', () => {
    beforeEach(() => {
      shallowMountComponent({}, {}, { campaignId: 'test-id' });
      CertificationApi.certifyCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveCertifyBulkAction();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      const updateCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'updateCertificationTaskList');
      wrapper.vm.saveCertifyBulkAction('comments');

      await flushPromises();
      expect(updateCertificationTaskListSpy).toHaveBeenCalledWith('certifySuccess');
    });
  });
  describe('saveRevokeCertificationTasks', () => {
    beforeEach(() => {
      shallowMountComponent({}, {}, { campaignId: 'test-id' });
      CertificationApi.revokeCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveRevokeCertificationTasks();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      const updateCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'updateCertificationTaskList');
      wrapper.vm.saveRevokeCertificationTasks('comments');

      await flushPromises(); // TODO: change to flushPromises();
      expect(updateCertificationTaskListSpy).toHaveBeenCalledWith('revokeSuccess');
    });
  });
  describe('saveAllowExceptionBulkAction', () => {
    beforeEach(() => {
      shallowMountComponent({}, {}, { campaignId: 'test-id' });
      CertificationApi.exceptionCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveAllowExceptionBulkAction();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      const updateCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'updateCertificationTaskList');
      wrapper.vm.saveAllowExceptionBulkAction('comments');

      await flushPromises();
      expect(updateCertificationTaskListSpy).toHaveBeenCalledWith('allowExceptionSuccess');
    });
  });
  describe('showReassignBulkActionModal', () => {
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.showReassignBulkActionModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReassignAccountModal');
    });
  });
  describe('openActionConfirmationModal', () => {
    it('should set the actionConfirmationModalProps with the params', () => {
      const expectedValue = {
        title: 'title',
        description: 'description',
        placeHolder: 'placeHolder',
        okLabel: 'okLabel',
        okFunction: () => {},
      };
      wrapper.vm.openActionConfirmationModal(expectedValue);
      expect(wrapper.vm.actionConfirmationModalProps).toEqual(expectedValue);
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.openActionConfirmationModal({});
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskActionConfirmAccountModal');
    });
  });

  describe('field property', () => {
    it('should contain the new entitlement column when the prop showEntitlementColumn is true', () => {
      shallowMountComponent({}, {}, { showEntitlementColumn: true });
      expect(wrapper.vm.tasksFields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'entitlement',
          }),
        ]),
      );
    });
    it('should not contain the new entitlement column when the prop showEntitlementColumn is false', () => {
      shallowMountComponent({}, {}, { showEntitlementColumn: false });
      expect(wrapper.vm.tasksFields).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'entitlement',
          }),
        ]),
      );
    });
  });

  describe(('Role based grants'), () => {
    const nonRoleBased = {
      data: {
        result: [
          {
            id: 'testId',
            user: {},
            account: {},
            application: {},
            entitlement: {},
            permissions: {
              certify: true,
              revoke: true,
              exception: true,
            },
            decision: {
              certification: {},
            },
            descriptor: {
              idx: {
                '/entitlement': {
                  displayName: 'entitlement name',
                },
                '/account': {
                  displayName: 'account name',
                },
              },
            },
          },
        ],
      },
    };

    const roleBased = cloneDeep(nonRoleBased);
    roleBased.data.result[0].relationship = {
      properties: {
        grantTypes: [
          {
            grantType: 'role',
          },
        ],
      },
    };

    beforeEach(() => {
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('shows revoke for non-role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(nonRoleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(true);
    });

    it('hides revoke action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('shows exception for non-role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(nonRoleBased));
      mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(true);
    });

    it('hides exception action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(false);
    });

    it('hides multiselect option', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'multiselect-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('changes tooltip text from certify to acknowledge', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'tooltip-certify-testId');
      expect(revoke.exists()).toBe(true);
      expect(revoke.text()).toBe('governance.certificationTask.actions.acknowledge');
    });
  });

  describe('line item details', () => {
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockReturnValue(Promise.resolve({ data: { result: [] } }));
    let showErrorMessageSpy;
    beforeEach(() => {
      shallowMountComponent();
      showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    });

    it('openUserModal called saves currentUserSelectedModal data and shows GovernanceUserDetailsModal', async () => {
      const id = 'id-test';
      const user = {
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).toEqual(user);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'GovernanceUserDetailsModal');
    });

    it('openUserModal called saves currentUserSelectedModal and it must not match the user if it has a property that is not allowed.', async () => {
      const id = 'id-test';
      const user = {
        password: 'test-password',
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).not.toEqual(user);
    });

    it('getCertificationLineItemUser should call api error', async () => {
      const error = new Error('ERROR');
      const id = 'id-test';
      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.reject(error));

      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.error.getUserError');
    });

    it('openApplicationModal called saves currentApplicationSelectedModal data and shows CertificationTaskApplicationModal', async () => {
      const application = {
        id: '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4',
        name: 'TestADApp',
      };

      const applicationOwners = [{
        id: '44a33897-8647-419d-8148-31defab70467',
        userName: 'igaadmin',
      }];

      await wrapper.vm.openApplicationModal(application, applicationOwners, { test1: 'test1' });
      await flushPromises();

      expect(wrapper.vm.currentApplicationSelectedModal).toEqual({
        ...application,
        applicationOwners,
        glossary: { test1: 'test1' },
      });
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskApplicationModal');
    });

    it('openAccountModal called saves currentAccountSelectedModal data and shows CertificationTaskAccountModal', async () => {
      CertificationApi.getCertificationTaskAccountDetails.mockImplementation(() => Promise.resolve({
        account: {
          id: 'test',
          displayName: 'Dani Morales',
        },
      }));
      const content = {
        account: {
          id: 'test',
          displayName: 'Dani Morales',
        },
        item: {
          decision: {
            certification: {
              decision: 'certify',
              decisionDate: '2023-02-28T15:12:25+00:00',
              decisionBy: {
                givenName: 'Foo',
                id: 'managed/user/1',
                mail: 'foo@test.com',
                sn: 'Test',
                userName: 'FooTest',
              },
            },
          },
        },
        relationship: {},
      };

      wrapper.vm.openAccountModal(content);
      await flushPromises();

      expect(wrapper.vm.currentAccountSelectedModal).toEqual({
        account: { account: content.account },
        decision: content.item.decision.certification.decision,
        decisionDate: content.item.decision.certification.decisionDate,
        decisionBy: content.item.decision.certification.decisionBy,
      });
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAccountModal');
    });

    it('openCommentsModal called saves currentCommentsSelectedModal, currentLineItemIdSelectedModal data and shows CertificationTaskCommentsModal', async () => {
      const comments = [
        {
          action: 'comment',
          comment: 'test comment',
          user: {
            givenName: 'Testuser',
          },
        },
      ];
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openCommentsModal(comments, { id: lineItemId });
      await flushPromises();

      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(comments);
      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsAccountModal');
    });

    it('openAddCommentModalFromCommentsModal called hides CertificationTaskCommentsModal and shows CertificationTaskAddCommentModal', async () => {
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskCommentsAccountModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentAccountModal');
    });

    it('openAddCommentModal called saves currentLineItemIdSelectedModal data and shows CertificationTaskAddCommentModal', async () => {
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentAccountModal');
    });

    it('addComment calls governance api properly', async () => {
      const comment = 'Test comment';
      const task = {
        id: '1',
        decision: {
          certification: {
            comments: [
              {
                action: 'comment',
                comment: 'comment 1',
              },
              {
                action: 'comment',
                comment: 'comment 2',
              },
            ],
          },
        },
      };

      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.tasksData = [task];
      const spyNotification = jest.spyOn(wrapper.vm, 'displayNotification');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskAddCommentAccountModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsAccountModal');
    });

    it('addComment calls governance api error', async () => {
      const comment = 'Test comment';
      const task = {
        id: '1',
        decision: {
          certification: {
            comments: [
              {
                comment: 'comment 1',
              },
              {
                comment: 'comment 2',
              },
            ],
          },
        },
      };
      const error = new Error();

      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.tasksData = [task];
      CertificationApi.saveComment.mockImplementation(() => Promise.reject(error));
      const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith(error, 'governance.certificationTask.error.addCommentErrorDefaultMessage');
    });

    it('openReviewersModal should open reviewers modal with data setted', async () => {
      const id = '12345';
      const actors = [
        {
          id: '/managed/user/12345',
          givenName: 'test',
        },
        {
          id: '/managed/rolw/12345',
          name: 'test',
        },
      ];
      const reassign = true;
      const item = {
        id,
        decision: {
          certification: {
            actors,
          },
        },
        permissions: {
          reassign,
        },
      };

      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersAccountModal');

      wrapper.vm.openReviewersModal(item);

      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(id);
      expect(wrapper.vm.currentReviewersSelectedModal).toEqual(actors);
      expect(wrapper.vm.currentLineItemReassignPermission).toBe(reassign);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersAccountModal');
    });

    it('closeEditReviewerModal should close edit reviewer modal and open reviewers modal', async () => {
      expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerModal');
      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerAccountModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersAccountModal');
      expect(wrapper.vm.currentReviewerSelectedModal).toBeNull();
      expect(wrapper.vm.currentUserPermissions).toEqual({});
    });

    describe('edit reviewer', () => {
      let permissions;
      let reviewers;
      let displayNotificationSpy;

      beforeEach(() => {
        CertificationApi.reassignLineItem.mockImplementation(() => Promise.resolve());
        CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.resolve());
        displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
        showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
        permissions = {
          comment: true,
          delegate: true,
          forward: true,
          reassign: true,
          consult: true,
          signoff: false,
          certify: false,
          exception: false,
          revoke: false,
          reset: false,
          save: true,
          removeActor: true,
          accept: true,
          challenge: true,
        };
        reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];
        wrapper.vm.currentReviewersSelectedModal = reviewers;
      });

      it('editReviewer should call api correctly new reviewer', async () => {
        const reviewerId = '/managed/user/123457';
        const newReviewer = {
          id: '/managed/user/123457',
          givenName: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: false,
            certify: false,
            exception: false,
            revoke: false,
            reset: false,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        };
        const newReviewers = reviewers.concat([newReviewer]);
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions, newReviewer);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.addReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('editReviewer should show error when the user is already a reviewer', async () => {
        const reviewerId = '/managed/user/12345';
        const newReviewer = {
          id: '/managed/user/12345',
          givenName: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: false,
            certify: false,
            exception: false,
            revoke: false,
            reset: false,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        };
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions, newReviewer);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('error', 'governance.certificationTask.lineItemReviewersModal.editReviewerUserExistsErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(reviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('editReviewer should call api error', async () => {
        const error = new Error('ERROR');
        CertificationApi.reassignLineItem.mockImplementation(() => Promise.reject(error));

        const reviewerId = '/managed/user/12345';
        [wrapper.vm.currentReviewerSelectedModal] = reviewers;
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.lineItemReviewersModal.editReviewerErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal.find((reviewer) => reviewer.id === reviewerId).permissions).toEqual({
          comment: true,
          delegate: true,
          forward: true,
          reassign: true,
          consult: true,
          signoff: true,
          certify: true,
          exception: true,
          revoke: true,
          reset: true,
          save: true,
          removeActor: true,
          accept: true,
          challenge: true,
        });
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('deleteReviewer should call api correctly do not close modal', async () => {
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');
        const newReviewers = [
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];

        wrapper.vm.deleteReviewer(reviewerId);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('deleteReviewer should call api correctly close modal', async () => {
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');
        const newReviewers = [
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];

        wrapper.vm.deleteReviewer(reviewerId, true);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('deleteReviewer should call api error', async () => {
        const error = new Error('ERROR');
        CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.reject(error));
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.deleteReviewer(reviewerId);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.lineItemReviewersModal.removeReviewerErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(reviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('isLastSignOffReviewer true', () => {
        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [, wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(true);
      });

      it('isLastSignOffReviewer false not selected reviewer', () => {
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
      });
    });

    it('openEntitlementModal should open entitlement modal with data setted', async () => {
      CertificationApi.getCertificationEntitlementDetails.mockImplementation(() => Promise.resolve({
        data: {
          name: 'test',
        },
      }));
      const lineItem = {
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
        application: {
          templateName: 'salesforce',
        },
        entitlement: { name: 'test' },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      };

      wrapper.vm.openEntitlementModal(lineItem);

      await flushPromises();

      expect(wrapper.vm.currentEntitlementSelected).toEqual({
        name: 'test',
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEntAccountModal');
    });
  });

  describe('Open edit reviewer modal', () => {
    describe('Admin view', () => {
      beforeEach(() => {
        shallowMountComponent({}, {}, { isAdmin: true });
      });

      it('openEditReviewerModal should open edit reviewer modal with data setted', async () => {
        const reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              certify: true,
              comment: true,
              exception: true,
              forward: false,
              reassign: false,
              reset: true,
              revoke: true,
              signoff: false,
            },
          },
          {
            id: '/managed/rolw/12345',
            name: 'test',
            permissions: {
              certify: true,
              comment: false,
              exception: true,
              forward: true,
              reassign: true,
              reset: true,
              revoke: true,
              signoff: true,
            },
          },
        ];
        const reviewer = {
          id: '/managed/user/12345',
          givenName: 'test',
        };

        expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersModal');
        expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerModal');

        wrapper.vm.currentReviewersSelectedModal = reviewers;
        wrapper.vm.openEditReviewerModal(reviewer);

        await flushPromises();

        expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
        expect(wrapper.vm.currentUserPermissions).toEqual({
          certify: true,
          comment: true,
          exception: true,
          forward: true,
          reassign: true,
          reset: true,
          revoke: true,
          signoff: true,
        });
        expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersAccountModal');
        expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerAccountModal');
      });
    });

    describe('EndUser view', () => {
      beforeEach(() => {
        shallowMountComponent({}, {}, { actorId: '/managed/user/12345' });
      });

      it('openEditReviewerModal should open edit reviewer modal with data setted', async () => {
        const reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              certify: true,
              comment: true,
              exception: true,
              forward: false,
              reassign: false,
              reset: true,
              revoke: true,
              signoff: false,
            },
          },
          {
            id: '/managed/rolw/12345',
            name: 'test',
            permissions: {
              certify: true,
              comment: false,
              exception: true,
              forward: true,
              reassign: true,
              reset: true,
              revoke: true,
              signoff: true,
            },
          },
        ];
        const reviewer = {
          id: '/managed/user/12345',
          givenName: 'test',
        };

        expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersModal');
        expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerModal');

        wrapper.vm.currentReviewersSelectedModal = reviewers;
        wrapper.vm.openEditReviewerModal(reviewer);

        await flushPromises();

        expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
        expect(wrapper.vm.currentUserPermissions).toEqual({
          certify: true,
          comment: true,
          exception: true,
          forward: false,
          reassign: false,
          reset: true,
          revoke: true,
          signoff: false,
        });
        expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersAccountModal');
        expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerAccountModal');
      });
    });
  });

  describe('Scenarios For Entitlements Tab', () => {
    let loadTasksListSpy;

    beforeEach(() => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      shallowMountComponent({}, {}, {
        certificationGrantType: 'entitlements', showEntitlementColumn: true, showGroupBy: false, entitlementUserId: null,
      });
      loadTasksListSpy = jest.spyOn(wrapper.vm, 'loadTasksList');
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadTasksList once the result of the call is ready', async () => {
      wrapper.vm.getCertificationTaskList(2);

      await flushPromises();
      expect(loadTasksListSpy).toHaveBeenCalled();
    });
    it('should show the right columns for entilements tab', () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'user', label: 'governance.certificationTask.user', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'application', label: 'governance.certificationTask.application', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'entitlement', label: 'governance.certificationTask.entitlement', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'account', label: 'governance.certificationTask.account', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-208px border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('openAddCommentModalFromCommentsModal called hides CertificationTaskCommentsModal and shows CertificationTaskAddCommentModal', async () => {
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskCommentsEntitlementModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentEntitlementModal');
    });

    it('openAddCommentModal called saves currentLineItemIdSelectedModal data and shows CertificationTaskAddCommentModal', async () => {
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentEntitlementModal');
    });
    it('openEntitlementModal should open entitlement modal with data setted', async () => {
      CertificationApi.getCertificationEntitlementDetails.mockImplementation(() => Promise.resolve({
        data: {
          name: 'test',
        },
      }));
      const lineItem = {
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
        application: {
          templateName: 'salesforce',
        },
        entitlement: { name: 'test' },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      };

      wrapper.vm.openEntitlementModal(lineItem);

      await flushPromises();

      expect(wrapper.vm.currentEntitlementSelected).toEqual({
        name: 'test',
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEntEntitlementModal');
    });
    it('openCommentsModal called saves currentCommentsSelectedModal, currentLineItemIdSelectedModal data and shows CertificationTaskCommentsModal', async () => {
      const comments = [
        {
          action: 'comment',
          comment: 'test comment',
          user: {
            givenName: 'Testuser',
          },
        },
      ];
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openCommentsModal(comments, { id: lineItemId });
      await flushPromises();

      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(comments);
      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsEntitlementModal');
    });
    it('openReviewersModal should open reviewers modal with data setted', async () => {
      const id = '12345';
      const actors = [
        {
          id: '/managed/user/12345',
          givenName: 'test',
        },
        {
          id: '/managed/rolw/12345',
          name: 'test',
        },
      ];
      const reassign = true;
      const item = {
        id,
        decision: {
          certification: {
            actors,
          },
        },
        permissions: {
          reassign,
        },
      };

      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersEntitlementModal');

      wrapper.vm.openReviewersModal(item);

      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(id);
      expect(wrapper.vm.currentReviewersSelectedModal).toEqual(actors);
      expect(wrapper.vm.currentLineItemReassignPermission).toBe(reassign);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersEntitlementModal');
    });
    it('openEditReviewerModal should open edit reviewer modal with data setted', async () => {
      const reviewers = [
        {
          id: '/managed/user/12345',
          givenName: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: true,
            certify: true,
            exception: true,
            revoke: true,
            reset: true,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        },
        {
          id: '/managed/rolw/12345',
          name: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: false,
            certify: true,
            exception: true,
            revoke: true,
            reset: true,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        },
      ];
      const reviewer = {
        id: '/managed/user/12345',
        givenName: 'test',
      };

      expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersModal');
      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerModal');

      wrapper.vm.currentReviewersSelectedModal = reviewers;
      wrapper.vm.openEditReviewerModal(reviewer);

      await flushPromises();

      expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersEntitlementModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerEntitlementModal');
    });

    it('closeEditReviewerModal should close edit reviewer modal and open reviewers modal', async () => {
      expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerModal');
      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerEntitlementModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersEntitlementModal');
    });
    it('addComment calls governance api properly', async () => {
      const comment = 'Test comment';
      const task = {
        id: '1',
        decision: {
          certification: {
            comments: [
              {
                action: 'comment',
                comment: 'comment 1',
              },
              {
                action: 'comment',
                comment: 'comment 2',
              },
            ],
          },
        },
      };

      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.tasksData = [task];
      wrapper.vm.getCertificationTaskList = jest.fn().mockImplementation(() => Promise.resolve({}));
      const spyNotification = jest.spyOn(wrapper.vm, 'displayNotification');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskAddCommentEntitlementModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsEntitlementModal');
    });
    it('should emit the bv::show::modal to show the certification task sort', () => {
      wrapper.vm.openCertificationTaskSortModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskSortConfirmEntitlementModal');
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.showReassignBulkActionModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReassignEntitlementModal');
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.openActionConfirmationModal({});
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskActionConfirmEntitlementModal');
    });
  });

  describe('Scenarios For Accounts Tab when group by is true', () => {
    beforeEach(() => {
      shallowMountComponent({}, {}, {
        certificationGrantType: 'accounts', showEntitlementColumn: false, showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      wrapper.vm.$refs = { selectableTable: { clearSelected: jest.fn(), selectRow: jest.fn() } };
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct account columns', async () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'user', label: 'governance.certificationTask.user', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'application', label: 'governance.certificationTask.application', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'account', label: 'governance.certificationTask.account', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-208px border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('should have selectable as true', async () => {
      expect(wrapper.vm.isSelectable).toEqual(true);
    });
    it('should clear row selection on filter', async () => {
      const filters = {
        decision: [
          'revoke',
          'exception',
          'noDecision',
        ],
      };
      wrapper.vm.filterCertificationItems(filters);
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should clear row selection on page change', async () => {
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should hide group by when accounts count is zero', () => {
      const accountDataMock = {
        data: {
          result: [],
          totalCount: 0,
        },
      };
      wrapper.vm.loadTasksList(accountDataMock, 1);
      expect($emit).toBeCalledWith('hide-group-by');
    });
    it('should have the right base filter for account', () => {
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([
        {
          operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' },
          operator: 'EQUALS',
        },
        { operand: { targetName: 'item.type', targetValue: 'accountGrant' }, operator: 'EQUALS' }]);
    });
    it('should raise select item event on row select', () => {
      const items = [
        {
          id: 'ebf15835-d35c-4268-bac3-a6ec59302246',
        },
      ];
      wrapper.vm.tasksData = items;
      wrapper.vm.onRowSelected(items);
      expect($emit).toBeCalledWith('select-item', items[0]);
    });
    it('should raise activity modal event with right modal id', () => {
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect($emit).toBeCalledWith('bv::show::modal', 'CertificationTaskActivityAccountModal');
    });
    it('should raise activity modal event with right modal id and set the right activity items', () => {
      const item = {
        decision: {
          certification: {
            comments: [{
              action: 'comment',
              comment: 'test comment',
            },
            {
              action: 'exception',
              comment: 'exception comment',
            }],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.currentLineItemActivity).toEqual([{
        action: 'exception',
        comment: 'exception comment',
      }]);
    });
    it('should raise forward modal event with right modal id', () => {
      wrapper.vm.openForwardCertificationModal('1234', true);
      expect($emit).toBeCalledWith('bv::show::modal', 'CertificationTaskForwardAccountModal');
    });
  });

  describe('Scenarios For Entitlements Tab when group by is true', () => {
    let getCertificationTasksListByCampaignSpy;
    beforeEach(() => {
      shallowMountComponent({}, {}, {
        certificationGrantType: 'entitlements', showEntitlementColumn: true, showGroupBy: true, entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6', isAdmin: true, refreshTasks: true,
      });
      wrapper.vm.$refs = { selectableTable: { clearSelected: jest.fn(), selectRow: jest.fn() } };
      getCertificationTasksListByCampaignSpy = jest.fn().mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationTasksListByCampaign = getCertificationTasksListByCampaignSpy;
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct entitlement columns', async () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'entitlement', label: 'governance.certificationTask.entitlement', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-208px border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('should have the right base filter for account', () => {
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([{ operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' }, { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' }]);
    });
    it('should call the backend api with correct params when grouped by', async () => {
      const filters = {
        decision: [
          'revoke',
          'exception',
          'noDecision',
        ],
      };
      wrapper.vm.filterCertificationItems(filters);
      await flushPromises();
      expect(getCertificationTasksListByCampaignSpy).toHaveBeenCalledWith({
        actorId: '',
        appendUserPermissions: true,
        isAdmin: true,
        pageNumber: 0,
        pageSize: 10,
        sortBy: 'user.givenName',
        sortDir: 'asc',
        taskStatus: 'active',
      },
      'test-id',
      {
        targetFilter: {
          operand: [
            {
              operand: [{ operand: { targetName: 'decision.certification.decision', targetValue: ['revoke', 'exception'] }, operator: 'IN' },
                { operand: [{ operand: { targetName: 'decision.certification.decision', targetValue: undefined }, operator: 'EXISTS' }], operator: 'NOT' },
              ],
              operator: 'OR',
            },
            { operand: { targetName: 'user.id', targetValue: '66f3b405-60db-42a6-8a7a-59f6470348f6' }, operator: 'EQUALS' },
            { operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' },
            { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' }],
          operator: 'AND',
        },
      });
    });
    it('should raise activity modal event with right modal id', () => {
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect($emit).toBeCalledWith('bv::show::modal', 'CertificationTaskActivityEntitlementModal');
    });
    it('should raise forward modal event with right modal id', () => {
      wrapper.vm.openForwardCertificationModal('1234', true);
      expect($emit).toBeCalledWith('bv::show::modal', 'CertificationTaskForwardEntitlementModal');
    });
  });
  describe('Verify items', () => {
    const resource = {
      data: {
        result: [{
          decision: {
            certification: {
              status: 'test',
              comments: '',
            },
          },
          user: {
            id: '',
            givenName: '',
            username: '',
          },
          icon: '',
          id: 'test-id-0',
          permissions: {
            certify: true,
            revoke: true,
            exception: true,
            forward: true,
            comment: true,
          },
          application: {
            name: 'testApp',
          },
        }],
      },
    };
    it('are disabled and do not exist if is in staging with showGroupBy and test certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'staging',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'test',
        showGroupBy: true,
      });
      wrapper.vm.loadTasksList(resource, 1);
      await flushPromises();

      const bulkSelectBtn = findByTestId(wrapper, 'bulk-select-btn');
      expect(bulkSelectBtn.exists()).toBeFalsy();
      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeFalsy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeFalsy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeTruthy();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeTruthy();
      const forwardBtn = findByTestId(wrapper, 'forward-button-test-id-0');
      expect(forwardBtn.classes()).toContain('disabled');
      const addCommentBtn = findByTestId(wrapper, 'add-comment-button-test-id-0');
      expect(addCommentBtn.classes()).toContain('disabled');
      const cartReviewersBtn = findByTestId(wrapper, 'cert-reviewers-button-test');
      expect(cartReviewersBtn.classes()).toContain('disabled');
    });
    it('are enabled and do exist if is not in staging with showGroupBy and test certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'in-progress',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'test',
        showGroupBy: true,
      });
      wrapper.vm.loadTasksList(resource, 1);
      await flushPromises();

      const bulkSelectBtn = findByTestId(wrapper, 'bulk-select-btn');
      expect(bulkSelectBtn.exists()).toBeTruthy();
      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeTruthy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeTruthy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeFalsy();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeFalsy();
      const forwardBtn = findByTestId(wrapper, 'forward-button-test-id-0');
      expect(forwardBtn.classes()).not.toContain('disabled');
      const addCommentBtn = findByTestId(wrapper, 'add-comment-button-test-id-0');
      expect(addCommentBtn.classes()).not.toContain('disabled');
      const cartReviewersBtn = findByTestId(wrapper, 'cert-reviewers-button-test');
      expect(cartReviewersBtn.classes()).not.toContain('disabled');
    });
    it('does exist if it not in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'in-progress',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'accounts',
        showGroupBy: true,
      });
      wrapper.vm.loadTasksList(resource, 1);
      await flushPromises();
      const selectEntitlementBtn = findByTestId(wrapper, 'btnSelectEntitlement-test-id-0');
      expect(selectEntitlementBtn.exists()).toBeTruthy();
    });
    it('does not exist if it is in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'staging',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'accounts',
        showGroupBy: true,
      });
      await flushPromises();
      wrapper.vm.loadTasksList(resource, 1);
      const selectEntitlementBtn = findByTestId(wrapper, 'btnSelectEntitlement-test-id-0');
      expect(selectEntitlementBtn.exists()).toBeFalsy();
    });
  });
});
