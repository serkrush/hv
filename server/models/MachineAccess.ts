export enum PermissionLevel {
  Viewer = "viewer",
  User = "user",
  Admin = "admin",
  SuperAdmin = "super-admin",
}

export const permissionLevels = [
    PermissionLevel.Viewer,
    PermissionLevel.User,
    PermissionLevel.Admin,
    PermissionLevel.SuperAdmin,
];

export interface IMachineAccess {
  id?: string;
  userId: string;
  machineGroupId?: string;
  machineId?: string;
  permissionLevel: PermissionLevel;

  //create
  email?: string;
}

export interface TMachineAccess {
  [key: string]: IMachineAccess
}