import React from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import Input from "../Form/Input";
import { ICategoryEntity, RecipeProcessType } from "@/src/entities/EntityTypes";

interface ICategoryFormProps {
  category: ICategoryEntity;
  onCategorySave: (data: ICategoryEntity) => void;
}

export default function CategoryForm(props: ICategoryFormProps) {
    const { t } = useTranslation();

    const formik = useFormik({
        initialValues: {
            ...props.category,
            recipe_process:
        props.category?.recipe_process || RecipeProcessType.Recipe,
        },
        validate: (values: ICategoryEntity) => {
            const errors: Partial<ICategoryEntity> = {};
            if (!values.category_name) {
                errors.category_name = t("Required");
            }
            return errors;
        },
        onSubmit: (values) => {
            props?.onCategorySave(values);
        },
    });

    const handleCategoryNameChange = (event) => {
        formik.setErrors({});
        formik.handleChange(event);
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="w-full">
                <div className="mb-2 text-center">{t("add-category")}</div>
                <Input
                    name="category_name"
                    value={formik.values.category_name}
                    onChange={handleCategoryNameChange}
                    required={true}
                    error={formik.errors.category_name}
                />
                <button
                    type="submit"
                    className="mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {t("save")}
                </button>
            </div>
        </form>
    );
}
