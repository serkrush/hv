import getConfig from 'next/config';
import {BaseEntity} from './BaseEntity';
import {initializeApp} from 'firebase/app';
import {Auth, getAuth} from 'firebase/auth';
import {firebaseErrors} from '@/src/utils/firebaseErrors';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
} from 'firebase/auth';
import alias from './decorators/alias';

const {
    publicRuntimeConfig: {DEV, ENVIRONMENT, devFirebaseConfig, firebaseConfig},
} = getConfig();

import {
    getStorage,
    ref,
    uploadBytes,
    deleteObject,
    listAll,
    getDownloadURL,
} from 'firebase/storage';


@alias('Firebase')
export default class Firebase extends BaseEntity<Firebase> {
    private _app: any;
    private _auth: Auth;
    private _storage: any;

    constructor(opts: any) {
        super(opts);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.signIn = this.signIn.bind(this);
        // this.isEmailExist = this.isEmailExist.bind(this);
        this.handleError = this.handleError.bind(this);
        this.tryAutoLogin = this.tryAutoLogin.bind(this);
        this.sendResetPasswordEmail = this.sendResetPasswordEmail.bind(this);
    }

    public init() {
        let config = devFirebaseConfig;
        switch (ENVIRONMENT) {
        case 'dev':
            config = devFirebaseConfig
            break;
        case 'prod':
            config = firebaseConfig
            break;
        }
        // Initialize Firebase
        this._app = initializeApp(config);
        this._auth = getAuth(this._app);
        this._storage = getStorage(this._app);
    }

    public get auth() {
        return this._auth;
    }

    public get storage() {
        return this._storage;
    }

    public async uploadFile(base64Image: string, file: any) {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], {type: 'image/png'});

        const storageRef = ref(this._storage, file);
        return uploadBytes(storageRef, blob);
    }

    public async deleteFile(file: any) {
        try {
            const desertRef = ref(this._storage, file);
            await deleteObject(desertRef);
        } catch (error) {
            const {t, ToastEmitter} = this.di;
            const message = t('error-delete-file', {fileName: file});
            ToastEmitter.errorMessage(message);
            console.error(message);
            return this.handleError(error);
        }
    }

    public async deleteFolder(name: any) {
        try {
            const folderRef = ref(this._storage, name);
            const folderSnapshot = await listAll(folderRef);

            const deletePromises = [
                ...folderSnapshot.items.map(fileRef => deleteObject(fileRef)),
                ...folderSnapshot.prefixes.map(dirRef =>
                    this.deleteFolder(dirRef.fullPath),
                ),
            ];
            return Promise.all(deletePromises);
        } catch (error) {
            console.error(`Error deleting folder ${name}:`, error);
            return this.handleError(error);
        }
    }

    public async copyFolder(folder1: string, folder2: string) {
        try {
            const sourceFolderRef = ref(this._storage, folder1);
            const folderSnapshot = await listAll(sourceFolderRef);
    
            const copyPromises = folderSnapshot.items.map(async (fileRef) => {
                const fileName = fileRef.name;
                const destinationPath = `${folder2}/${fileName}`;
    
                const fileURL = await getDownloadURL(fileRef);
                const response = await fetch(fileURL);
                const blob = await response.blob();
    
                const destinationRef = ref(this._storage, destinationPath);
                await uploadBytes(destinationRef, blob);
            });
    
            const folderCopyPromises = folderSnapshot.prefixes.map(async (subDirRef) => {
                const subFolderName = subDirRef.name;
                const subSourcePath = `${folder1}/${subFolderName}`;
                const subDestinationPath = `${folder2}/${subFolderName}`;
                await this.copyFolder(subSourcePath, subDestinationPath);
            });
    
            await Promise.all([...copyPromises, ...folderCopyPromises]);
            console.log(`Folder ${folder1} successfully copied to ${folder2}`);
        } catch (error) {
            console.error(`Error copying folder from ${folder1} to ${folder2}:`, error);
            return this.handleError(error);
        }
    }
    

    public async tryAutoLogin() {
        try {
            if (this.auth.currentUser != null) {
                return await this.auth.currentUser
                    ?.getIdToken()
                    .catch(error => {
                        console.log('error: ', error);
                        return this.handleError(error);
                    });
            } else {
                return null;
            }
        } catch (error) {
            console.log('error: ', error);
            return this.handleError(error);
        }
    }

    public async login(email, password, getUid = false) {
        try {
            let response = await signInWithEmailAndPassword(
                this.auth,
                email,
                password,
            ).catch(error => {
                console.log('error: ', error);
                return this.handleError(error);
            });
            if ((response as any).user && !getUid) {
                return await (response as any).user
                    .getIdToken()
                    .catch(error => {
                        console.log('error: ', error);
                        return this.handleError(error);
                    });
            }
            if (
                (response as any).user &&
                (response as any).user.uid &&
                getUid
            ) {
                return await (response as any).user.uid;
            } else {
                return response;
            }
        } catch (error) {
            console.log('error: ', error);
            return this.handleError(error);
        }
    }

    public async signIn(email, password) {
        const response = await createUserWithEmailAndPassword(
            this.auth,
            email,
            password,
        ).catch(error => {
            console.log('error: ', error);
            return this.handleError(error);
        });

        return response;
    }

    public async logout() {
        try {
            let response = await this.auth.signOut().catch(error => {
                console.log('error: ', error);
                return this.handleError(error);
            });
            return response;
        } catch (error) {
            console.log('error: ', error);
            return this.handleError(error);
        }
    }

    public async sendResetPasswordEmail(email) {
        try {
            let response = await sendPasswordResetEmail(this.auth, email).catch(
                error => {
                    console.log('error: ', error);
                    return this.handleError(error);
                },
            );
            return response;
        } catch (error) {
            console.log('error: ', error);
            return this.handleError(error);
        }
    }

    public handleError(error) {
        let titleCode = '';
        let messageCode = '';
        switch (error.code) {
        case firebaseErrors.AUTH_INVALID_EMAIL:
        case firebaseErrors.AUTH_WRONG_PASSWORD:
        case firebaseErrors.AUTH_WEEK_PASSWORD:
        case firebaseErrors.AUTH_USER_DISABLED:
        case firebaseErrors.AUTH_USER_NOT_FOUND:
        case firebaseErrors.AUTH_OPERATION_NOT_ALLOWED:
        case firebaseErrors.AUTH_EMAIL_ALREADY_IN_USE:
        case firebaseErrors.AUTH_INVALID_CREDENTIAL:
            titleCode = error.code + '-title';
            messageCode = error.code + '-message';
            break;
        default:
            titleCode = 'default-error-title';
            messageCode = 'default-error-message';
            break;
        }
        return {
            error: error,
            titleCode: titleCode,
            messageCode: messageCode,
        };
    }
}
