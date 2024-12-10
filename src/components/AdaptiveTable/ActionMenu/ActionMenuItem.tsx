import React, { useMemo, useCallback, MouseEvent, FocusEvent } from 'react';
import { IMenuData } from '@/acl/types';
import { useTranslation } from 'react-i18next';


interface IMenuItemProps {
    className?: string;
    menuItem: IMenuData;

    handleAction: (item: IMenuData) => void;
}

export function ActionMenuItem(props: IMenuItemProps){
    const { menuItem, handleAction } = props;
    const { t } = useTranslation(['common']);
    
    const actionMenuItemClickHandler = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleAction(menuItem);
    }, [handleAction, menuItem]);

    const icon = useMemo(() => menuItem.icon, [menuItem.icon]);
    const label = useMemo(() => menuItem.label, [menuItem.label]);

    const onActionMenuItemBlur = useCallback((e: FocusEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e['focusLosted'] = menuItem['index'];
    }, [menuItem]);

    return(
        <li >
            <button onBlur={onActionMenuItemBlur} onClick={actionMenuItemClickHandler}
                className='action-menu-item space-x-2'>
                
                {icon && (
                    <div className='text-xs text-gray-100'>
                        { icon() }
                    </div>
                )}

                <p className='text-xs font-normal text-gray-900'>
                    { label }
                </p>
            </button>
        </li>
    );
}
