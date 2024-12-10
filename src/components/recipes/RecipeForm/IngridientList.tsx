import React from 'react';
import Input from '../../Form/Input';
import {TrashIcon} from '@heroicons/react/24/outline';
import {IIngredientEntity} from '@/src/entities/EntityTypes';
import UploadImage from '../../Form/UploadImage';
import {Modals} from '@/src/constants';
import ImageStore from '../../Form/ImageStore';
import Textarea from '../../Form/Textarea';
import { setFlagger } from '@/store/types/actionTypes';
import { useDispatch } from 'react-redux';

interface IngridientListProps {
    data: IIngredientEntity[];
    inputName: string;
    title: string;
    id?: string;
    addBtnText: string;
    handleChange: (event: any) => void;
    handleRemove: (index: number, inputName: string) => void;
    handleAdd: () => void;
    errors?: any;
    labelInput?: string;
    handleAddImage?: (data: any, index: number) => void | undefined;
    handleDelBufferImage?: (index: number) => void | undefined;
    deleteIngredientImages?: (fileName: string) => void;
}

export default function IngridientList(props: IngridientListProps) {
    const dispatch = useDispatch();
    return (
        <>
            <p className="mb-3">{props.title}</p>
            {props.data?.length > 0 &&
                props.data.map((ingredient, index) => {
                    return (
                        <div
                            className="mb-3"
                            key={`${index}-${ingredient?.index}`}>
                            <div
                                key={`${index}`}
                                className="grid grid-cols-6 items-center gap-x-4">
                                <div className="col-span-4">
                                    <Textarea
                                        name={`${props.inputName}[${ingredient?.index}].description`}
                                        value={ingredient?.description}
                                        onChange={props.handleChange}
                                        required={true}
                                        label={props.labelInput}
                                        error={
                                            props.errors &&
                                            props.errors.length > 0 &&
                                            props.errors[ingredient?.index]
                                                ?.description
                                        }
                                        rows={5}
                                    />
                                    <Input
                                        name={`${props.inputName}[${ingredient.index}].action`}
                                        value={ingredient?.action}
                                        onChange={props.handleChange}
                                        required={true}
                                        hidden={true}
                                        readOnly={true}
                                    />
                                </div>
                                {ingredient?.media_resource ? (
                                    <ImageStore
                                        folder={`recipes/${props.id}`}
                                        name={ingredient?.media_resource}
                                        handleDelImage={() => {
                                            dispatch(setFlagger(Modals.DeleteMethodImage, ingredient?.media_resource));
                                        }}
                                    />
                                ) : (
                                    props.handleAddImage !== undefined && (
                                        <UploadImage
                                            handleDelImage={() =>
                                                props.handleDelBufferImage(
                                                    ingredient?.index,
                                                )
                                            }
                                            image={
                                                ingredient?.media_resource_buffer
                                            }
                                            nameDialog={`${Modals.CropDialog}${index}`}
                                            handleAddImage={data =>
                                                props.handleAddImage(
                                                    data,
                                                    ingredient?.index,
                                                )
                                            }
                                        />
                                    )
                                )}

                                <button
                                    className="inline-flex w-max"
                                    onClick={() => {
                                        ingredient?.media_resource &&
                                            props.deleteIngredientImages(
                                                ingredient?.media_resource,
                                            );
                                        props.handleRemove(
                                            index,
                                            props.inputName,
                                        );
                                    }}
                                    type="button">
                                    <TrashIcon
                                        className="h-6 w-6 shrink-0 text-gray-600"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>
                    );
                })}
            <button
                onClick={props.handleAdd}
                type="button"
                className="mt-2 flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                {props.addBtnText}
            </button>
        </>
    );
}
