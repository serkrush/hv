import { MongoClient, Db, Collection } from 'mongodb';
import { IUser } from './models/User';
import { IMachineModel } from './models/MachineModel';
import { IMachine } from './models/Machine';
import { IMachineGroup, IMachinesMeta } from './models/MachineGroup';
import { IMachineAccess } from './models/MachineAccess';
import { ICategoryModel } from './models/ICategoryModel';
import { IRecipeModel } from './models/IRecipeModel';
import { IInvitation } from './models/Invitation';
import { IRecipeFavoritesModel } from './models/IRecipeFavoritesModel';
import { ICycleModel } from './models/ICycleModel';
import BaseContext from './di/BaseContext';
import IContextContainer from './di/interfaces/IContextContainer';


export default class MongoDB extends BaseContext {
    private _client: MongoClient;
    private _db: Db;

    private isSetuped = false;

    constructor(opts: IContextContainer) {
        super(opts);
        this.setupIfNeeded();
    }

    public async setupIfNeeded() {
        if (this.isSetuped) return;

        const uri = this.di.config.mongodbUri;
        const dbName = this.di.config.mongodbDatabase;

        this._client = new MongoClient(uri);
        await this._client.connect();
        this._db = this._client.db(dbName);

        this.isSetuped = true;
    }

    public get db(): Db {
        if (!this._db) throw new Error('Database is not initialized.');
        return this._db;
    }

    public getCollection<T>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }

    public get users(): Collection<IUser> {
        return this.getCollection<IUser>('users');
    }

    public get categories(): Collection<ICategoryModel> {
        return this.getCollection<ICategoryModel>('categories');
    }

    public get recipes(): Collection<IRecipeModel> {
        return this.getCollection<IRecipeModel>('recipes');
    }

    public get presets(): Collection<IRecipeModel> {
        return this.getCollection<IRecipeModel>('presets');
    }

    public get recipeFavorites(): Collection<IRecipeFavoritesModel> {
        return this.getCollection<IRecipeFavoritesModel>('recipeFavorites');
    }

    public get models(): Collection<IMachineModel> {
        return this.getCollection<IMachineModel>('models');
    }

    public get machines(): Collection<IMachine> {
        return this.getCollection<IMachine>('machines');
    }

    public get machinesGroups(): Collection<IMachineGroup> {
        return this.getCollection<IMachineGroup>('machinesGroups');
    }

    public get machinesAccess(): Collection<IMachineAccess> {
        return this.getCollection<IMachineAccess>('machinesAccess');
    }

    public get invitations(): Collection<IInvitation> {
        return this.getCollection<IInvitation>('invitations');
    }

    public get cycles(): Collection<ICycleModel> {
        return this.getCollection<ICycleModel>('cycles');
    }

    public async closeConnection() {
        if (this._client) {
            await this._client.close();
        }
    }
}


// import * as admin from 'firebase-admin';
// import {schema} from 'typesaurus';
// import {IUser} from './models/User';

// import {IMachineModel} from './models/MachineModel';
// import {IMachine} from './models/Machine';
// import {IMachineGroup, IMachinesMeta} from './models/MachineGroup';
// import {IMachineAccess} from './models/MachineAccess';
// import {ICategoryModel} from './models/ICategoryModel';
// import {IRecipeModel} from './models/IRecipeModel';

// import {IInvitation} from './models/Invitation';
// import BaseContext from './di/BaseContext';
// import IContextContainer from './di/interfaces/IContextContainer';
// import {Firestore} from '@google-cloud/firestore';
// import {auth, messaging, storage} from 'firebase-admin';
// import {IRecipeFavoritesModel} from './models/IRecipeFavoritesModel';

// import prodServiceAccount from '../serviceAccountKey.json';
// import devServiceAccount from '../serviceAccountKeyDev.json';
// import {ICycleModel} from './models/ICycleModel';

// const dbSchema = schema($ => ({
//     users: $.collection<IUser>().sub({
//         categories: $.collection<ICategoryModel>().sub({
//             categories: $.collection<ICategoryModel>().sub({
//                 categories: $.collection<ICategoryModel>(),
//             }),
//         }),
//         recipes: $.collection<IRecipeModel>().sub({
//             categories: $.collection<ICategoryModel>(),
//         }),
//         presets: $.collection<IRecipeModel>(),
//         recipeFavorites: $.collection<IRecipeFavoritesModel>(),
//     }),
//     models: $.collection<IMachineModel>(),
//     machines: $.collection<IMachine>().sub({
//         categories: $.collection<ICategoryModel>().sub({
//             categories: $.collection<ICategoryModel>().sub({
//                 categories: $.collection<ICategoryModel>(),
//             }),
//         }),
//         recipes: $.collection<IRecipeModel>().sub({
//             categories: $.collection<ICategoryModel>(),
//         }),
//         presets: $.collection<IRecipeModel>(),
//         recipeFavorites: $.collection<IRecipeFavoritesModel>(),
//     }),
//     machinesGroups: $.collection<IMachineGroup>().sub({
//         machines: $.collection<IMachinesMeta>(),
//     }),
//     machinesAccess: $.collection<IMachineAccess>(),
//     invitations: $.collection<IInvitation>(),
//     categories: $.collection<ICategoryModel>().sub({
//         categories: $.collection<ICategoryModel>().sub({
//             categories: $.collection<ICategoryModel>(),
//         }),
//     }),
//     recipes: $.collection<IRecipeModel>().sub({
//         categories: $.collection<ICategoryModel>(),
//     }),
//     presets: $.collection<IRecipeModel>(),
//     recipeFavorites: $.collection<IRecipeFavoritesModel>(),
//     cycles: $.collection<ICycleModel>(),
// }));

// export {dbSchema};

// export default class Firebase extends BaseContext {
//     private _auth: auth.Auth;
//     private _firestore: Firestore;
//     private _messaging: messaging.Messaging;
//     private _storage: storage.Storage;

//     private isSetuped = false;

//     constructor(opts: IContextContainer) {
//         super(opts);
//         this.setupIfNeeded();
//     }

//     public setupIfNeeded() {
//         if (this.isSetuped) return;
//         const serviceAccount = this.getServiceAccountKey();
//         if (
//             !admin.apps.length ||
//             (admin.apps[0]?.options?.credential &&
//                 admin.apps[0]?.options?.credential['projectId'] !=
//                     serviceAccount.projectId)
//         ) {
//             admin.initializeApp({
//                 credential: admin.credential.cert(serviceAccount),
//                 storageBucket: this.di.config.dev ? this.di.config.devFirebaseConfig.storageBucket : this.di.config.firebaseConfig.storageBucket
//             });
//         }
//         const app = admin.app();
//         this._auth = admin.auth(app);
//         this._firestore = admin.firestore(app);
//         this._messaging = admin.messaging(app);
//         this._storage = admin.storage(app);
//         this.isSetuped = true;
//     }

//     public getServiceAccountKey() {
//         switch (this.di.config.environment) {
//         case 'dev':
//             return devServiceAccount;
//         case 'prod':
//             return prodServiceAccount;
//         default:
//             return devServiceAccount;
//         }
//     }

//     public get auth() {
//         return this._auth;
//     }

//     public get firestore() {
//         return this._firestore;
//     }

//     public get messaging() {
//         return this._messaging;
//     }

//     public get storage() {
//         return this._storage;
//     }

//     public get schema() {
//         this.setupIfNeeded();
//         return dbSchema;
//     }
// }
