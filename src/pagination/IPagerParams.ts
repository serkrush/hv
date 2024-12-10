interface ISortParams {
    field: string;
    sort?: number;
    dir?: string;
}

export interface IPagerParams {
    pageName?: string;  // paginator name
    // sort?: object;      // object with sorting key/values
    sort?: ISortParams; 
    filter?: any;//object;    // object with filtering key/values
    page?: number;       // page number
    perPage: number;    // count items on one page
    force?: boolean;    // reload data in the redux and pager
    count?: number;     // count by filter, if 0 need to recalculate, if > 0 count doesn't need to calculate
    entityName?: string;

    lastDocumentId?: string;
}

export interface RangeDate {
    startDate: any;
    endDate: any;
}

export enum Sort { ASC = 1, DESC = -1, none = 0 }

export enum Actions {
    View = 1,
    Edit = 2,
    Delete = 3, 
    Request = 4, 
    Add = 5,  
    Move = 6, 
    Check = 7,
    Image = 8,
    EditSmall = 10,
}

export enum PaginationType  {
    SHORT = 'SHORT',
    LIGHT = 'LIGHT',
    MEDIUM = 'MEDIUM',
}

export interface IOptions {
    label: string;
    value: string | number;
}

export enum InputIcon {
    USER = 'user',
    PASSPORT = 'passport',
    EDIT = 'edit',
    EMAIL = 'email',
    SPINNER = 'spinner',
    SEARCH = 'search',
    PASSWORD = 'password',
    ERROR = 'error'
}

export enum FilterType {    
    Text = 'Text',
    Select = 'Select',
    SingleDate = 'SingleDate',
    DateRange = 'DateRange',
    Touche = 'Touche',
    Radio = 'Radio',
    VerticalRadio = 'VerticalRadio',
    GroupButton = 'GroupButton',
    VerticalGroupButton = 'VerticalGroupButton',
    EllipseButton = 'EllipseButton',
    CheckBox = 'CheckBox',
    VerticalCheckBox = 'VerticalCheckBox',
    FilterReset = 'FilterReset',
    Number = 'Number',
}
export interface IField {
    label?: string;
    placeholder?: string;
    type?: FilterType;
    initialValue?: any;
    sorted?: boolean;
    rowClassName?: string;
    column?: {
        itemClassName?: string;
        headClassName?: string;
        inputClassName?: string;
        editable?: boolean;
        draw?: (object: any, field?: string) => JSX.Element;
        disabled?: (object: any, field?: string) => void;
        options?: Array<IOptions>;
    };
    filter?: {
        group: string;
        /** container styles */
        className?: string;
        /** container styles */
        inputClassName?: string;
        activeClassName?: string;
        labelClassName?: string;
        showLabel?: boolean;
        icon?: InputIcon;
        options?: Array<IOptions>;
        customLabel?: string;
    };
}

export interface IFieldList {
    [field: string]: IField;
}