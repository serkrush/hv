import React, { useState, useMemo, useCallback, useEffect, MouseEvent } from 'react';
import get from "lodash/get";
import { useAcl } from 'src/hooks/useAcl';
import { useTranslation } from 'react-i18next';
import { clickOutSideTheBlock } from 'src/utils/random';
import { ActionMenuItem } from './ActionMenuItem';
import { FaCog } from 'src/components/FaIcons/icons';
import { IMenu, IMenuData } from '@/acl/types';

interface IActionMenuProps {
    data: any;
    menu?: IMenu;
}
export default function ActionMenu(props: IActionMenuProps){
    const { data, menu } = props;
    const { t } = useTranslation();
    const { allow } = useAcl();

    const ACTION_MENU_ID = useMemo(() => `ActionMenu_${get(data, 'id')}`, [data]);

    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (actionMenuItem: IMenuData) => {

    };

    const RenderMenuItems = useMemo(() => {
        return menu && Object.keys(menu)
            .filter((key: string) => {
                const i: IMenuData = menu[key];
                const isAllowed = allow(i.grant, key);
                /* FOR TEST TEMPORARY RETURN NOT ALLOWED */
                return !isAllowed;
            })
            .map((key: string, i: number) => {
                const menuItem: IMenuData = menu[key];
                menuItem['index'] = i;
                return <ActionMenuItem menuItem={menuItem} handleAction={handleAction} key={key} />;
            });
    }, [allow, menu]);

    const windowClickActionMenu = useCallback((event: any) => {
        (isOpen && !clickOutSideTheBlock(event, ACTION_MENU_ID)) && setIsOpen(false);
    }, [ACTION_MENU_ID, isOpen]);

    useEffect(() => {
        window.addEventListener('click', windowClickActionMenu);
        
        return () => {
            window.removeEventListener('click', windowClickActionMenu);
        };
    }, [windowClickActionMenu]);
    
    const menuClickHandler = useCallback((e: MouseEvent) => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    
    return (
        <div id={ACTION_MENU_ID} className='relative'>
            
            <button className='table-icon text-gray-200 hover:bg-gray-400'
                type='button' onClick={menuClickHandler}>    
                
                <FaCog className='text-lg'/>
            </button>

            {isOpen && (
                <div className='mt-7 absolute top-0 right-0 rounded-lg overflow-hidden bg-white shadow-2xl z-10'>
                    <div className='py-2'>
                        <div className='py-1 px-2 w-full'>
                            <p className='text-xs text-gray-200 font-semibold whitespace-nowrap'>
                                { `${t('choose-action')}:` }
                            </p>
                        </div>

                        <div className='w-full'>
                            <ul>
                                {RenderMenuItems}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}