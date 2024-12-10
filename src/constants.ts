import {AuthType, GRANT, IIdentity, ROLE} from '@/acl/types';
import {
    TCategoryEntities,
    TInvitationEntities,
    TMachineEntities,
    TUserEntities,
} from './entities/EntityTypes';
import {AuthState, RequestStatusState} from '@/store/types/stateTypes';
import {CycleStatus} from '@/server/models/ICycleModel';
import { IHashState } from '@/store/reducers/hashReducer';
import { TMachineAccess } from '@/server/models/MachineAccess';
import { TMachineGroup } from '@/server/models/MachineGroup';

export enum Flag {
    UsersPerPage = 'users-per-page',
    RecipesPerPage = 'recipes-per-page',

    SelectedUser = 'SELECTED_USER',
    SelectUserMode = 'SELECT_USER_MODE',

    SelectedNavOption = 'SELECTED_NAV_OPTION',

    UserCardDelete = 'USER_CARD_DELETE',
    UserFormDelete = 'USER_FORM_DELETE',

    ACTION_START = 'action-start',
    ACTION_SUCCESS = 'action-success',
    ACTION_FAILURE = 'action-failure',

    InvitationIdForConfirm = 'invitation-id-for-confirm',
    InviteConfirmedSuccess = 'invite-confirmed-success',
    InviteRecipeConfirmedSuccess = 'invite-recipe-confirmed-success',
    InviteRejectedSuccess = 'invite-rejected-success',
    InvitationInfoReceived = 'invitation-info-received',
    CategoryDelete = 'CATEGORY_DALATA',

    CountPendingStatusUpdate = 'count-pending-status-update',
    StatusUpdateReceived = 'status-update-received',

    CurrentUpdatedMachineId = 'current-updated-machine-id',

    LastStatusUpdateTime = 'last-status-update-time',
    LastStatusUpdateRequestTime = 'last-status-update-request-time',
    StatusUpdateCompleted = 'status-update-completed',

    SPINER = 'spiner',
}

export const SHORT_GUID_LENGTH = -8;

export const DEFAULT_PER_PAGE = 20;

export const DEFAULT_SORT_FIELD = 'createdAt';
export const DEFAULT_SORT_DIR = 'desc';

export const DEFAULT_ROLE = ROLE.OWNER; //"owner";
export const DEFAULT_INVITATION_ROLE = ROLE.USER; //"user";
export const DEFAULT_LANGUAGE_CODE = 'enUS';
export const DEFAULT_CURRENCY = '$';
export const DEFAULT_COUNTRY = 'AU';
export const DEFAULT_SCALE = 'metric';
export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

export const roles = ['root', 'owner', 'user'];
export const languages: string[] = ['enUS', 'uk'];
export const countriesCodes: string[] = ['US', 'AU', 'CA', 'UK', 'NZ'];
export const timezones: string[] = [
    "Africa/Abidjan",
    "Africa/Accra",
    "Africa/Algiers",
    "Africa/Bissau",
    "Africa/Cairo",
    "Africa/Casablanca",
    "Africa/Ceuta",
    "Africa/El_Aaiun",
    "Africa/Johannesburg",
    "Africa/Khartoum",
    "Africa/Lagos",
    "Africa/Maputo",
    "Africa/Monrovia",
    "Africa/Nairobi",
    "Africa/Ndjamena",
    "Africa/Tripoli",
    "Africa/Tunis",
    "Africa/Windhoek",
    "America/Anchorage",
    "America/Araguaina",
    "America/Argentina/Buenos_Aires",
    "America/Asuncion",
    "America/Bahia",
    "America/Barbados",
    "America/Belem",
    "America/Belize",
    "America/Boa_Vista",
    "America/Bogota",
    "America/Campo_Grande",
    "America/Cancun",
    "America/Caracas",
    "America/Cayenne",
    "America/Cayman",
    "America/Chicago",
    "America/Costa_Rica",
    "America/Cuiaba",
    "America/Curacao",
    "America/Danmarkshavn",
    "America/Dawson_Creek",
    "America/Denver",
    "America/Edmonton",
    "America/El_Salvador",
    "America/Fortaleza",
    "America/Godthab",
    "America/Grand_Turk",
    "America/Guatemala",
    "America/Guayaquil",
    "America/Guyana",
    "America/Halifax",
    "America/Havana",
    "America/Hermosillo",
    "America/Iqaluit",
    "America/Jamaica",
    "America/La_Paz",
    "America/Lima",
    "America/Los_Angeles",
    "America/Maceio",
    "America/Managua",
    "America/Manaus",
    "America/Martinique",
    "America/Mazatlan",
    "America/Mexico_City",
    "America/Miquelon",
    "America/Montevideo",
    "America/Nassau",
    "America/New_York",
    "America/Noronha",
    "America/Panama",
    "America/Paramaribo",
    "America/Phoenix",
    "America/Port-au-Prince",
    "America/Port_of_Spain",
    "America/Porto_Velho",
    "America/Puerto_Rico",
    "America/Recife",
    "America/Regina",
    "America/Rio_Branco",
    "America/Santiago",
    "America/Santo_Domingo",
    "America/Sao_Paulo",
    "America/Scoresbysund",
    "America/St_Johns",
    "America/Tegucigalpa",
    "America/Thule",
    "America/Tijuana",
    "America/Toronto",
    "America/Vancouver",
    "America/Whitehorse",
    "America/Winnipeg",
    "America/Yellowknife",
    "Antarctica/Casey",
    "Antarctica/Davis",
    "Antarctica/DumontDUrville",
    "Antarctica/Mawson",
    "Antarctica/Palmer",
    "Antarctica/Rothera",
    "Antarctica/Syowa",
    "Antarctica/Vostok",
    "Asia/Almaty",
    "Asia/Amman",
    "Asia/Aqtau",
    "Asia/Aqtobe",
    "Asia/Ashgabat",
    "Asia/Baghdad",
    "Asia/Baku",
    "Asia/Bangkok",
    "Asia/Beirut",
    "Asia/Bishkek",
    "Asia/Brunei",
    "Asia/Calcutta",
    "Asia/Choibalsan",
    "Asia/Colombo",
    "Asia/Damascus",
    "Asia/Dhaka",
    "Asia/Dili",
    "Asia/Dubai",
    "Asia/Dushanbe",
    "Asia/Gaza",
    "Asia/Ho_Chi_Minh",
    "Asia/Hong_Kong",
    "Asia/Hovd",
    "Asia/Irkutsk",
    "Asia/Jakarta",
    "Asia/Jayapura",
    "Asia/Jerusalem",
    "Asia/Kabul",
    "Asia/Kamchatka",
    "Asia/Karachi",
    "Asia/Katmandu",
    "Asia/Krasnoyarsk",
    "Asia/Kuala_Lumpur",
    "Asia/Macau",
    "Asia/Magadan",
    "Asia/Makassar",
    "Asia/Manila",
    "Asia/Nicosia",
    "Asia/Omsk",
    "Asia/Pyongyang",
    "Asia/Qatar",
    "Asia/Rangoon",
    "Asia/Riyadh",
    "Asia/Saigon",
    "Asia/Seoul",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Taipei",
    "Asia/Tashkent",
    "Asia/Tbilisi",
    "Asia/Tehran",
    "Asia/Thimphu",
    "Asia/Tokyo",
    "Asia/Ulaanbaatar",
    "Asia/Vladivostok",
    "Asia/Yakutsk",
    "Asia/Yekaterinburg",
    "Asia/Yerevan",
    "Asia/Yuzhno-Sakhalinsk",
    "Atlantic/Azores",
    "Atlantic/Bermuda",
    "Atlantic/Canary",
    "Atlantic/Cape_Verde",
    "Atlantic/Faroe",
    "Atlantic/Reykjavik",
    "Atlantic/South_Georgia",
    "Atlantic/Stanley",
    "Australia/Adelaide",
    "Australia/Brisbane",
    "Australia/Darwin",
    "Australia/Hobart",
    "Australia/Perth",
    "Australia/Sydney",
    "Etc/GMT",
    "Europe/Amsterdam",
    "Europe/Andorra",
    "Europe/Athens",
    "Europe/Belgrade",
    "Europe/Berlin",
    "Europe/Brussels",
    "Europe/Bucharest",
    "Europe/Budapest",
    "Europe/Chisinau",
    "Europe/Copenhagen",
    "Europe/Dublin",
    "Europe/Gibraltar",
    "Europe/Helsinki",
    "Europe/Istanbul",
    "Europe/Kaliningrad",
    "Europe/Kyiv",
    "Europe/Lisbon",
    "Europe/London",
    "Europe/Luxembourg",
    "Europe/Madrid",
    "Europe/Malta",
    "Europe/Minsk",
    "Europe/Monaco",
    "Europe/Moscow",
    "Europe/Oslo",
    "Europe/Paris",
    "Europe/Prague",
    "Europe/Riga",
    "Europe/Rome",
    "Europe/Samara",
    "Europe/Sofia",
    "Europe/Stockholm",
    "Europe/Tallinn",
    "Europe/Tirane",
    "Europe/Vienna",
    "Europe/Vilnius",
    "Europe/Warsaw",
    "Europe/Zurich",
    "Indian/Chagos",
    "Indian/Christmas",
    "Indian/Cocos",
    "Indian/Kerguelen",
    "Indian/Mahe",
    "Indian/Maldives",
    "Indian/Mauritius",
    "Indian/Reunion",
    "Pacific/Apia",
    "Pacific/Auckland",
    "Pacific/Chuuk",
    "Pacific/Easter",
    "Pacific/Efate",
    "Pacific/Enderbury",
    "Pacific/Fakaofo",
    "Pacific/Fiji",
    "Pacific/Funafuti",
    "Pacific/Galapagos",
    "Pacific/Gambier",
    "Pacific/Guadalcanal",
    "Pacific/Guam",
    "Pacific/Honolulu",
    "Pacific/Kiritimati",
    "Pacific/Kosrae",
    "Pacific/Kwajalein",
    "Pacific/Majuro",
    "Pacific/Marquesas",
    "Pacific/Nauru",
    "Pacific/Niue",
    "Pacific/Norfolk",
    "Pacific/Noumea",
    "Pacific/Pago_Pago",
    "Pacific/Palau",
    "Pacific/Pitcairn",
    "Pacific/Pohnpei",
    "Pacific/Port_Moresby",
    "Pacific/Rarotonga",
    "Pacific/Tahiti",
    "Pacific/Tarawa",
    "Pacific/Tongatapu",
    "Pacific/Wake",
    "Pacific/Wallis"
];
export const scales: string[] = ['metric', 'imperial'];
export const thicknesses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];
export const cycleStatuses = [
    CycleStatus.Started,
    CycleStatus.Scheduled,
    CycleStatus.Completed,
];

export interface StateColors {
    content: string;
    border: string;
    background: string;
}

export enum ZoneAvailableState {
    Available = 'available',
    InProgress = 'in-progress',
    Scheduled = 'scheduled',
    Offline = 'offline',
    Error = 'error',
}

export enum ZoneAdditionalStatus {
    None = 'none',
    Idle = 'idle',
    Paused = 'paused',
    Cooling = 'cooling',
    Cleaning = 'cleaning',
}

export enum MeasurementSystem {
    Metric = 'metric',
    Imperial = 'imperial',
}


export const scaledValueMap = {
    temperature: {
        [MeasurementSystem.Metric]: 'C',
        [MeasurementSystem.Imperial]: 'F',
    },
    weight: {
        [MeasurementSystem.Metric]: 'kg',
        [MeasurementSystem.Imperial]: 'lb',
    },
    distance: {
        [MeasurementSystem.Metric]: 'm',
        [MeasurementSystem.Imperial]: 'ft',
    },
};

export const TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60;

export const USER_TABLE = 'UsersTable';

export const STATUS_UPDATE_TIME = 30 * 1000;

export const GUEST_IDENTITY: IIdentity = {
    userId: ROLE.GUEST,
    role: ROLE.GUEST,
    locale: 'en-US',
    timezone: 'america/arizona',
    languageCode: 'enUS',
    countryCode: 'US',
    scale: 'metric',
    authType: AuthType.Default
};

export interface InjectedIdentityProps {
    allow?: (grant: GRANT, res?: string, role?: ROLE) => boolean;
    identity?: any;
    isItMe?: (userId: string) => boolean;
    store: any;
    query: any;
}

export interface IZMState {
    initTemperature: number; // initial temperature that was set by user, celsius value
    heatingIntensity: number; // heating intensity, percentage value (%)
    fanPerformance1: number; // performance of fan #1, percentage value (%)
    fanPerformance2: number; // performance of fan #2, percentage value (%)
    exitTemperature: number; // temperature at the exit of the zone, celsius value
    entryTemperature: number; // temperature at the entrance of the zone, celsius value
    weight: number; // current weight, grams
    door: number; // state of the door, open (0) or closed (1)
    zoneNumber?: number;
}

export interface IZoneParams {
    // set of parameters for zone module
    initTemperature: number; // initial temperature that was set by user, celsius value
    heatingIntensity: number; // heating intensity, percentage value (%)
    fanPerformance1: number; // performance of fan #1, percentage value (%)
    fanPerformance2: number; // performance of fan #2, percentage value (%)

    // set of parameters for business logic
    duration: number; // cycle duration in minutes,
    weight: number; // a weight that should be achieved for dehydration cycle
}

export interface ICycleState {
    machineId: string;
    /** zone module state (current cycle parameters) */
    state: IZMState;
    /** parameters for stage, index is stage; */
    params: IZoneParams[];
    /**
     * each bit of this variable show the current mode of zone
     * The bit index defined in ZMode enum.
     * bit 0 - food drying cycle is active 1/0
     * bit 1 - food drying cycle is paused 1/0
     * bit 2 - cooling cycle is active 1/0
     * bit 3 - sanitization cycle is active 1/0
     */
    mode: number;
    /** left time for current stage, duration in seconds */
    duration: number;
    /** left time for all stages, duration in seconds */
    total: number;
    /** zone which the parameters from / number of module in GPIO network */
    zoneNumber: number;
    /** current stage number */
    stage: number;
    /** current stage number */
    amountOfStages: number;
    /** time in milliseconds of last state update */
    timestamp: number;
    /** grams, current weight. The value calculates from raw value and based on nominal and tare weights */
    weight: number;
    /** power usage, kWh */
    power: number;
    /** instantaneous power, Wh */
    instantPower: number;
    /** recipe id, if null the cycle was started by manual control */
    recipeId?: string;

    transferTimestamp?: number; // time in milliseconds of last state data update
}

export enum Cacher {
    AllCategories = 'all-categories',
    AllGlobalRecipes = 'all-recipes',
    AllModels = 'all-models'
}

export enum ErrorCode {
    NoUserForId = 'no-user-for-id', //"not found user for uid"
    NoRecipeForId = 'no-recipe-for-id', //"not found recipe for uid"
    NotAccessedAction = 'not-accessed-action', //"not accessed action"
    TokenNotVerify = 'token-not-verified', //"token not verified"
    NotInvitationForId = 'no-invitation-for-id', //"not found invitation for id"
    NoAccessForId = 'no-access-for-id', // "not found machines access for id"
    NotProvidedUser = 'not-provided-user', // "not provided user"
    NotProvidedRecource = 'not-provided-recource', // "not provided recource"
    NotFoundUserForEmail = 'not-found-user-for-email', //"not found user for email"
    NotFoundMachineGroup = 'not-found-machine-group', //"not found machines group for id"
    NotFoundModel = 'not-found-model', //"not found machine model for id"
    NotFoundMachine = 'not-found-machine', //"not found machines group for id"
    NotFoundCategory = 'not-found-category', //"not found category for id"
    NoRecipeFavoriteId = 'not-found-recipe-favorite', //"not found recipe favorite for id"
    UserAlreadyExist = 'user-already-exist', //"user with same email already exist
    UserAlreadyHaveInvite = 'user-already-have-invite', //"user already have invite
    Unauthorized = 'unathorized', //unauthorized
    ForbiddenResource = 'forbidden', //forbidden resource
    NoTokenProvided = 'no-token-provided', //"No token provided"
    NotFoundCycle = 'not-found-cycle', //"not found machine cycle for id"

    IdentityUpdatingError = 'identity-updating-error', //"Identity update failed"

    LoginFailed = 'login-failed', //"Login failed"
    RegisterFailed = 'register-failed', // "User register fail"
    InviteSentFailed = 'invite-sent-failed', //"Can not send invite"
    InviteAcceptFailed = 'invite-accept-failed', //invite accept failed
    InviteReceiveFailed = 'invite-receive-failed', //"can not receive invite"

    MachinesReceiveFailed = 'machines-receive-failed', //"Can not receive machine"
    MachineAddFailed = 'machine-add-failed', //"Can not add machine"
    MachineUpdateFailed = 'machine-update-failed', //"Can not update machine"
    MachineFetchFailed = 'machine-info-fetched-failed', //"Can not fetch machine info"
    MachineDeleteFailed = 'machine-delete-failed', //"Can not delete machine"
    MachinePairFailed = 'machine-pair-failed', //"Can not pair machine"
    MachinePairConfirmFailed = 'machine-pair-confirm-failed', //"Can not pair machine"
    FCMTokenUpdateFailed = 'fcm-token-update-failed', //

    MachineGroupsReceiveFailed = 'machine-groups-receive-failed', //"Can not receive machine groups"
    MachineGroupAddFailed = 'machine-group-add-failed', //"Can not add machine group"
    MachineGroupCreateFailed = 'machine-group-create-failed', //"Can not create machine group"
    MachineGroupUpdateFailed = 'machine-group-update-failed', //"Can not update machine group"
    MachineGroupFetchFailed = 'machine-group-info-fetched-failed', //"Can not fetch machine group info"
    MachineGroupDeleteFailed = 'machine-group-delete-failed', //"Can not delete machine group"
    MachineGroupMachinesReceiveFailed = 'machine-group-machines-receive-failed', //"Can not receive machine group machines"

    MachineAccessReceiveFailed = 'machine-access-receive-failed', //"Can not receive machine access"
    MachineAccessAddFailed = 'machine-access-add-failed', //"Can not add machine access"
    MachineAccessUpdateFailed = 'machine-access-update-failed', //"Can not update machine access"
    MachineAccessFetchFailed = 'machine-access-info-fetched-failed', //"Can not fetch machine access info"
    MachineAccessDeleteFailed = 'machine-access-delete-failed', //"Can not delete machine access"

    MachineReceivingMessageFailed = 'machine-receiving-failed',

    MachinesTrackFailed = 'machines-track-failed', //"machines track failed"
    MachinesUntrackFailed = 'machines-untrack-failed', //"machines untrack failed"

    CycleScheduleFailed = 'cycle-schedule-failed', //"cycle schedule failed"
    CycleReceiveFailed = 'cycle-receive-failed', //"cycle receive failed"
    CycleUpdateFailed = 'cycle-update-failed', // "cycle update failed"
    CycleDeleteFailed = 'cycle-delete-failed', // "cycle delete failed"

    RequestSendingFailed = 'request-sending-failed', // "request sending failed"

    UserDeleteFailedOwnMachine = 'user-delete-failed-own-machine',
    UserTransferRightsFailed = 'user-transfer-rights-failed',

    FCMRemoveFailed = 'fcm-remove-failed',
    FCMAddFailed = 'fcm-add-failed',
}

export enum MessageCode {
    InvitationDeleted = 'invitation-deleted', // Invitation for ${id} deleted success
    InvitationAccepted = 'invitation-accepted', // Invitation for ${id} deleted success
    MachineAccessDeleted = 'machine-access-deleted', // Machine Access for ${id} deleted success
    MachineAccessForUserDeleted = 'machine-access-for-user-deleted', // Machine Access for user deleted success
    MachineGroupDeleted = 'machine-group-deleted', // Machine Group for ${id} deleted success
    MachineModelDeleted = 'machine-model-deleted', // Machine Model for ${id} deleted success
    MachineDeleted = 'machine-deleted', // Machine for ${id} deleted success
    UserDeleted = 'user-deleted', // User for ${id} deleted success
    CycleDeleted = 'cycle-deleted', // Cycle for ${id} deleted success

    IdentityUpdated = 'identity-updated', // Identity updated successfully
    UserLogin = 'user-login', //"User logined success",
    UserRegister = 'user-register', //" User register success"
    InviteSent = 'invite-sent', //invite sent success
    InviteAccepted = 'invite-accept', //invite accepted success
    InviteReceived = 'invite-received', //invite received succes

    MachinesReceived = 'machines-received', //"machines receive success"
    MachineUpdated = 'machine-updated', //"machine updated success"
    MachineInfoFetched = 'machine-info-fetched', //"machine info fetched success"
    MachineAdded = 'machine-added', //"machine added success"
    MachinePaired = 'machine-paired', //"machine paired success"
    MachinePairConfirmed = 'machine-pair-confirmed', //"machine paired success"
    FCMTokenUpdated = 'fcm-token-updated', //

    MachineGroupsReceived = 'machine-groups-received', //"machine group receive success"
    MachineGroupUpdated = 'machine-group-updated', //"machine group updated success"
    MachineGroupInfoFetched = 'machine-group-info-fetched', //"machine group info fetched success"
    MachineGroupAdded = 'machine-group-added', //"machine group added success"
    MachineGroupCreated = 'machine-group-created', //"machine group created success"
    MachineGroupMachinesReceived = 'machine-groups-machines-received', //"machine group receive success"

    MachineAccessReceived = 'machine-access-received', //"machine access receive success"
    MachineAccessUpdated = 'machine-access-updated', //"machine access updated success"
    MachineAccessInfoFetched = 'machine-access-info-fetched', //"machine access info fetched success"
    MachineAccessAdded = 'machine-access-added', //"machine access added success"
    
    MachineReceivedMessage = 'machine-received-message', //"message was received successfully"
    
    MachinesTracked = 'machines-tracked', //"machines tracked success"
    MachinesUntracked = 'machines-untracked', //"machines untracked success"

    CycleScheduled = 'cycle-scheduled', //"cycle scheduled success"
    CycleReceived = 'cycle-received', //"cycle received success"
    CycleUpdated = 'cycle-updated', //"cycle deleted success"

    RequestSent = 'request-sent', // "request sent"


    UserTransferRights = 'transfer-rights', //"Your rights was successfully transferred".

    FCMRemoved = 'fcm-removed',
    FCMAdded = 'fcm-added',
}

export enum Modals {
    DeleteCategoryDialog = 'delete-category-dialog',
    SaveCategory = 'save-category',
    CropDialog = 'crop-dialog',
    DeleteFileDialog = 'delete-file-dialog',
    DeleteImage = 'delete-image',
    DeleteMethodImage = 'delete-method-image',
    DeleteRecipe = 'delete-recipe',
    DeleteUser = 'delete-user',
    DeleteMachineModel = 'delete-machine-model',
}

export enum ResponseCode {
    OK = 'OK',
    ERROR = 'ERROR',
    TOAST = 'TOAST',
}

export enum RequestStatus {
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export enum PushCommandType {

    CURRENT_STATE = 'CURRENT_STATE',

    UPDATE_IDENTITY = "UPDATE_IDENTITY"
}

export enum ENTITY {
    USERS = 'users',
    IDENTITY = 'identity',
    CATEGORIES = 'categories',
    MACHINES = 'machines',
    MACHINE_ACCESS = 'machineAccess',
    MACHINE_GROUPS = 'machineGroups',
    INVITATIONS = 'invitations',
    RECIPES = 'recipes',
    RECIPE_FAVORITES = 'recipes-favorites',
    PRESETS = 'presets',
    MACHINES_MODELS = 'machines-models',
    CYCLES = 'cycles',
    ZMState = 'zmState',
}

export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export enum ConnectionType {
    Unsetted = 'unsetted',
    Device = 'device',
    Client = 'client',
    Server = 'server',
}

export enum MachinePairRequestResult {
    Requested = 'requested',
    Existed = 'existed',
    NotOwner = 'not-owner',
}

export enum MachineResetRequestResult {
    Requested = 'requested',
    NotExist = 'not-exist',
    NotOwner = 'not-owner',
}

export interface IPaginationPage {
    ids: [string];
    lastDocumentId?: string;
    prevLastDocumentId?: string;
}
export interface IPaginationInfo {
    entityName: string;
    pageName: string;
    currentPage: number;
    count: number;
    perPage: number;
    filter?: {
        [key: string]: any;
    };
    sort?: {
        field: string;
        dir: SortDirection;
    };
    pages: {
        [key: number]: IPaginationPage;
    };
    fetching?: boolean;
}

export type TPaginationInfo = {
    [key: string]: IPaginationInfo;
};
export interface AppState {
    hashes: IHashState;
    flagger: any;
    pagination: TPaginationInfo;
    auth: AuthState;
    requestStatus: RequestStatusState;
    [ENTITY.USERS]: TUserEntities;
    [ENTITY.CATEGORIES]: TCategoryEntities;
    [ENTITY.MACHINES]: TMachineEntities;
    [ENTITY.INVITATIONS]: TInvitationEntities;
    [ENTITY.MACHINE_ACCESS]: TMachineAccess;
    [ENTITY.MACHINE_GROUPS]: TMachineGroup;
}

export interface NotificationMessage {
    uuid: number;
    title?: string,
    message: string,
    params?: any
    timestamp: number;
    actionType?: string
}
export interface MachineMessage extends NotificationMessage {
    moduleNumber: number;
    code: number;
    machineUid: string;
}
