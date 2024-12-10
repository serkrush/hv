import {asClass} from 'awilix';
import UserController from 'controllers/UserController';
import AuthController from './AuthController';
import MachineController from './MachineController';
import MachineGroupController from './MachineGroupController';

import MockController from './MockController';
import MachinesAccessController from './MachinesAccessController';
import InvitationController from './InvitationController';
import CategoryController from './CategoryController';
import RecipeController from './RecipeController';
import {IIdentity} from '@/acl/types';
import Guard from '@/acl/Guard';
import {IPagerParams} from '@/src/pagination/IPagerParams';
import MachineModelController from './MachineModelController';
import RecipeFavoritesController from './RecipeFavoritesController';
import CycleController from './CycleController';

export interface IControllerContainer {
    AuthController: AuthController;
    UserController: UserController;
    MachineController: MachineController;
    MachineModelController: MachineModelController;
    MachineGroupController: MachineGroupController;
    MockController: MockController;
    MachinesAccessController: MachinesAccessController;
    InvitationController: InvitationController;
    CategoryController: CategoryController;
    RecipeController: RecipeController;
    RecipeFavoritesController: RecipeFavoritesController;
    CycleController: CycleController;
}

export default {
    AuthController: asClass(AuthController).singleton(),
    UserController: asClass(UserController).singleton(),
    MachineController: asClass(MachineController).singleton(),
    MachineModelController: asClass(MachineModelController).singleton(),
    MachineGroupController: asClass(MachineGroupController).singleton(),
    MockController: asClass(MockController).singleton(),
    MachinesAccessController: asClass(MachinesAccessController).singleton(),
    InvitationController: asClass(InvitationController).singleton(),
    CategoryController: asClass(CategoryController).singleton(),
    RecipeController: asClass(RecipeController).singleton(),
    RecipeFavoritesController: asClass(RecipeFavoritesController).singleton(),
    CycleController: asClass(CycleController).singleton(),
};

export interface ActionProps {
    query: any;
    pager: IPagerParams | null;
    fnMessage: (message: any, code?: any, statusCode?: number) => void;
    fnError: (message: any, code?: any, statusCode?: number) => void;
    identity: IIdentity;
    guard: Guard;
}
