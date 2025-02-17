/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { merge, cloneDeep } from 'lodash';
import {
  isRoleBased,
  isReconBased,
  getGrantFlags,
  flags,
} from './flags';

const roleBasedGrant = {
  relationship: {
    properties: {
      grantTypes: [
        {
          grantType: 'role',
        },
      ],
    },
  },
};

const reconBasedGrant = {
  relationship: {
    properties: {
      grantTypes: [
        {
          grantType: 'recon',
        },
      ],
    },
  },
};

const notNewAccess = {
  item: {
    decision: {
      certification: {},
    },
  },
};

const temporalGrant = {
  relationship: {
    temporalConstraints: {},
  },
};

function addPreviousCertification(grant) {
  const newGrant = cloneDeep(grant);
  return merge(newGrant, notNewAccess);
}

describe('flags', () => {
  describe(('isRoleBased'), () => {
    it('determines if a grant is role based', () => {
      expect(isRoleBased(roleBasedGrant)).toBeTruthy();
    });

    it('determines when a grant is not role based', () => {
      expect(isRoleBased({})).toBeFalsy();
    });
  });

  describe(('isReconBased'), () => {
    it('determines if a grant is recon based', () => {
      expect(isReconBased(reconBasedGrant)).toBeTruthy();
    });

    it('determines when a grant is not recon based', () => {
      expect(isReconBased({})).toBeFalsy();
    });
  });

  describe(('getGrantFlags'), () => {
    it('recon', () => {
      const item = addPreviousCertification(reconBasedGrant);
      expect(getGrantFlags(item)).toEqual([flags.RECON]);
    });

    it('role based', () => {
      const item = addPreviousCertification(roleBasedGrant);
      expect(getGrantFlags(item)).toEqual([flags.ROLEBASED]);
    });

    it('no flags', () => {
      const item = addPreviousCertification({});
      expect(getGrantFlags(item)).toEqual([]);
    });

    it('new access', () => {
      expect(getGrantFlags({})).toEqual([flags.NEW_ACCESS]);
    });

    it('temporal', () => {
      const item = addPreviousCertification(temporalGrant);
      expect(getGrantFlags(item)).toEqual([flags.TEMPORAL]);
    });

    it('all flags', () => {
      const item = cloneDeep(reconBasedGrant);
      item.relationship.properties.grantTypes.push({ grantType: 'role' });
      merge(item, temporalGrant);
      expect(getGrantFlags(item)).toEqual([flags.RECON, flags.ROLEBASED, flags.NEW_ACCESS, flags.TEMPORAL]);
    });
  });
});
