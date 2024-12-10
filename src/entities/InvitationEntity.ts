import {call, put} from 'redux-saga/effects';
import {BaseEntity, HTTP_METHOD} from './BaseEntity';
import * as actionTypes from '@/store/types/actionTypes';
import action from './decorators/action';
import reducer from './decorators/reducer';
import {schema} from 'normalizr';
import alias from './decorators/alias';
import {ENTITY, Flag} from '../constants';

@alias('InvitationEntity')
@reducer('invitations')
export default class InvitationEntity extends BaseEntity<InvitationEntity> {
    constructor(opts: any) {
        super(opts);
        const users = new schema.Entity('users', {}, {idAttribute: 'uid'});
        const categories = [new schema.Entity(ENTITY.CATEGORIES)]
        this.initSchema('invitations', {receiver: users, categories}, {});
    }
}
