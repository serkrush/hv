export interface IMachinesMeta {
  id: string;
}

export interface IMachineGroup {
  id?: string;
  creatorId: string;
  name: string;
  location: string;
  machineIds?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface TMachineGroup {
  [key:string]: IMachineGroup
}