import {asClass} from 'awilix';

import UserEntity from './UserEntity';
import CategoryEntity from './CategoryEntity';
import RecipeEntity from './RecipeEntity';
import Identity from './Identity';
import Firebase from './Firebase';
// import Flagger from "./Flagger";
import InvitationEntity from './InvitationEntity';
import MachineModelEntity from './MachineModelEntity';
import MachineEntity from './MachineEntity';
import MachineAccessEntity from './MachineAccessEntity';
import MachineGroupEntity from './MachineGroupEntity';
import ZMStateEntity from './ZMStateEntity';

export interface IEntityContainer {
    UserEntity: UserEntity;
    CategoryEntity: CategoryEntity;
    RecipeEntity: RecipeEntity;
    Identity: Identity;
    Firebase: Firebase;
    MachineModelEntity: MachineModelEntity;
    MachineEntity: MachineEntity;
    MachineAccessEntity: MachineAccessEntity;
    MachineGroupEntity: MachineGroupEntity;
    ZMStateEntity: ZMStateEntity;
    // Flagger: Flagger;
    InvitationEntity: InvitationEntity;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    UserEntity: asClass(UserEntity).singleton(),
    CategoryEntity: asClass(CategoryEntity).singleton(),
    RecipeEntity: asClass(RecipeEntity).singleton(),
    Identity: asClass(Identity).singleton(),
    Firebase: asClass(Firebase).singleton(),
    // Flagger: asClass(Flagger).singleton(),
    InvitationEntity: asClass(InvitationEntity).singleton(),
    MachineModelEntity: asClass(MachineModelEntity).singleton(),
    MachineEntity: asClass(MachineEntity).singleton(),
    MachineAccessEntity: asClass(MachineAccessEntity).singleton(),
    ZMStateEntity: asClass(ZMStateEntity).singleton(),
    MachineGroupEntity: asClass(MachineGroupEntity).singleton()
};