import * as React from "react";
import Modal from "../Modal";
import CategoryForm from "./CategoryForm";
import { AppState, Modals } from "@/src/constants";
import { ICategoryEntity } from "@/src/entities/EntityTypes";
import { useDispatch, useSelector } from "react-redux";
import { setFlagger } from "@/store/types/actionTypes";

interface SaveCategoryProps {
  onSaveCategory: (category: ICategoryEntity) => void;
}

function SaveCategoryModal(props: SaveCategoryProps) {
    const category: ICategoryEntity = useSelector(
        (state: AppState) => state.flagger[Modals.SaveCategory]
    );
    const dispatch = useDispatch();

    const handleSave = (data: ICategoryEntity) => {
        dispatch(setFlagger(Modals.SaveCategory, null));
        props.onSaveCategory(data);
    };

    return (
        <Modal flagId={Modals.SaveCategory} className="sm:max-w-[300px]">
            <CategoryForm category={category} onCategorySave={handleSave} />
        </Modal>
    );
}

export default SaveCategoryModal;
