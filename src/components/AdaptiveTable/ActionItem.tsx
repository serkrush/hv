import React, { useMemo, useCallback, MouseEvent } from 'react';
import { Actions } from 'src/pagination/IPagerParams';
import { FaEye, FaPlus, FaEdit, FaFileAlt, FaTrashAlt, FaBars } from '../FaIcons/icons';
import { isFunction } from 'src/utils/random';

interface IActionItemProps {
    action: Actions;
    data: any;
    className?: string;
    buttonClassName?: string;
    onActionClick?: (action: Actions, data: any) => void;
    actionIsDisabled?: (action: Actions, data: any) => boolean;
}

export default function ActionItem(props: IActionItemProps) {
    const { data, action, onActionClick, actionIsDisabled: isActionActivePredicate, className, buttonClassName } = props;
    const actionClickHandler = useCallback((e: MouseEvent) => {
        if (isFunction(onActionClick)) {
            e.stopPropagation();
            if (onActionClick) {
                onActionClick(action, data);
            }
        }
    }, [action, data, onActionClick]);

    const { color, reactIcon, iconClassName } = useMemo((): { color: string, reactIcon: any, iconClassName: any } => {
        switch (action) {
        default:
        case Actions.Image:
            return {
                color: 'table-icon text-green-300 hover:bg-green-600',
                reactIcon: <FaEye />,
                iconClassName: 'text-lg',
            };
        case Actions.Add:
            return {
                color: 'table-icon text-green-300 hover:bg-green-600',
                reactIcon: <FaPlus />,
                iconClassName: '',
            };
        case Actions.Edit:
            return {
                color: 'table-icon text-blue-300 hover:bg-blue-600',
                reactIcon: 'edit',
                iconClassName: '',
            };
        case Actions.Request:
            return {
                color: 'table-icon text-blue-300 hover:bg-blue-600',
                reactIcon: <FaFileAlt />,
                iconClassName: '',
            };
        case Actions.Delete:
            return {
                color: 'table-icon text-red-300 hover:bg-red-500',
                reactIcon: 'delete',
                iconClassName: '',
            };
            //case: Actions.MenuDelete
        case Actions.Move:
            return {
                color: 'menu-action-icon text-black-500',
                reactIcon: <FaBars />,
                iconClassName: '',
            };
        case Actions.EditSmall:
            return {
                color: 'table-icon table-icon-sm text-blue-300 hover:bg-blue-600 w-1 h-1',
                reactIcon: <FaEdit />,
                iconClassName: '',
            };
        }
    }, [action]);

    const isDisabled = useMemo(() => isActionActivePredicate
        ? isActionActivePredicate(action, data)
        : false
    , [action, data, isActionActivePredicate]);

    return (
        <button type='button' className={`mx-1 ${color}`} onClick={actionClickHandler} disabled={isDisabled}>
            <span className={`${iconClassName}`}>{ reactIcon }</span>
        </button>
    );
}