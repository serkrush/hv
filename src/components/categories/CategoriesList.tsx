import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import {
    ICategoryEntity,
    RecipeProcessType,
    TCategoryEntities,
} from '@/src/entities/EntityTypes';
import {Modals} from '@/src/constants';
import {useDispatch} from 'react-redux';
import {setFlagger} from '@/store/types/actionTypes';
import { ButtonSubmitting } from '../Form/ButtonSubmitting';

interface ICategoriesListProps {
    level: number;
    parentCategoryId?: string | null;
    categories: ICategoryEntity[];
    selectParentCategory: (level: number, category: ICategoryEntity) => void;
    currentID;
}

export default function CategoriesList({
    level,
    parentCategoryId,
    categories,
    selectParentCategory,
    currentID,
}: ICategoriesListProps) {
    const {t} = useTranslation();
    const [selectedCategory, setSelectedCategory] =
        useState<ICategoryEntity | null>(null);
    const dispatch = useDispatch();
    const selectCagegory = (category: ICategoryEntity) => {
        setSelectedCategory(category);
        selectParentCategory(level, category);
    };

    const handleSaveCategory = (category?: ICategoryEntity | any) => {
        category =
            category ||
            ({
                parent_id: parentCategoryId,
                recipe_process: RecipeProcessType.Recipe,
            } as ICategoryEntity);
        dispatch(setFlagger(Modals.SaveCategory, category));
    };

    const handleDeleteCategory = (category: ICategoryEntity) => {
        dispatch(setFlagger(Modals.DeleteCategoryDialog, category));
    };
    const disabled = level !== 0 && parentCategoryId === null;

    useEffect(() => {
        if (currentID === null) {
            setSelectedCategory(null);
        }
    }, [currentID]);
    return (
        <div>
            <div className="flex justify-end">
                <div className="mb-2" >
                    <ButtonSubmitting type='button' disabled={disabled} onClick={() => {if(!disabled) handleSaveCategory()}} actionType='ADD' entityName='categories' translationLabel='add-category' colorClassNames={`bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-400 disabled:hover:bg-indigo-400`}/>
                </div>
            </div>
            <ul>
                {categories?.length > 0 &&
                    categories.map((category, index) => {
                        return (
                            <li
                                key={category.id}
                                onClick={() => selectCagegory(category)}
                                className={`flex cursor-pointer items-center justify-between p-2 text-gray-700 hover:bg-gray-50 ${
                                    (selectedCategory &&
                                        selectedCategory?.id === category.id) ||
                                    (!selectedCategory && index === 0)
                                        ? 'bg-gray-50 text-indigo-600'
                                        : ''
                                }`}>
                                <div>{category.category_name}</div>
                                <div>
                                    <button
                                        onClick={() =>
                                            handleSaveCategory(category)
                                        }
                                        className="mr-4">
                                        <PencilIcon
                                            className="h-6 w-6 shrink-0 text-gray-600"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteCategory(category)
                                        }>
                                        <TrashIcon
                                            className="h-6 w-6 shrink-0 text-gray-600"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
