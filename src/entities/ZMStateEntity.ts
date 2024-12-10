import { call } from 'redux-saga/effects';

import { ENTITY, Flag, STATUS_UPDATE_TIME } from '../constants';
import { BaseEntity, HTTP_METHOD } from './BaseEntity';
import alias from './decorators/alias';
import reducer from './decorators/reducer';
import { setFlagger } from '@/store/types/actionTypes';
import action from './decorators/action';

@alias('ZMStateEntity')
@reducer(ENTITY.ZMState)
export default class ZMStateEntity extends BaseEntity<ZMStateEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema(
            ENTITY.ZMState,
            {},
            {
                idAttribute: data => {
                    return `${data.machineId}_${data.zoneNumber}`;
                },
            },
        );
    }
}
