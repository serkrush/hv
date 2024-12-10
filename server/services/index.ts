import {asClass} from 'awilix';
import UserService from 'services/UserService';
import MachineModelService from './MachineModelService';
import MachineService from './MachineService';
import MachineGroupService from './MachineGroupService';
import MachineAccessService from './MachineAccessService';
import InvitationService from './InvitationService';
import CategoryService from './CategoryService';
import RecipeService from './RecipeService';
import Identity from 'services/Identity';
import RecipeFavoritesService from './RecipeFavoritesService';
import CycleService from './CycleService';

export interface IServicesContainer {
    UserService: UserService;
    Identity: Identity;
    MachineModelService: MachineModelService;
    MachineService: MachineService;
    MachineGroupService: MachineGroupService;
    MachineAccessService: MachineAccessService;
    InvitationService: InvitationService;
    CategoryService: CategoryService;
    RecipeService: RecipeService;
    RecipeFavoritesService: RecipeFavoritesService;

    CycleService: CycleService;
}

export default {
    UserService: asClass(UserService).singleton(),
    Identity: asClass(Identity).singleton(),
    MachineModelService: asClass(MachineModelService).singleton(),
    MachineService: asClass(MachineService).singleton(),
    MachineGroupService: asClass(MachineGroupService).singleton(),
    MachineAccessService: asClass(MachineAccessService).singleton(),
    InvitationService: asClass(InvitationService).singleton(),
    CategoryService: asClass(CategoryService).singleton(),
    RecipeService: asClass(RecipeService).singleton(),
    RecipeFavoritesService: asClass(RecipeFavoritesService).singleton(),

    CycleService: asClass(CycleService).singleton(),
};
