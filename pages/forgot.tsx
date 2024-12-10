import ContainerContext from "@/src/ContainerContext";
import { ButtonSubmitting } from "@/src/components/Form/ButtonSubmitting";
import AuthLayout from "@/src/components/layouts/AuthLayout";
import { createTitle } from "@/src/utils/createTitle";
import { useFormik } from "formik";
import Link from "next/link";
import { useContext } from "react";

export default function Base() {
    const di = useContext(ContainerContext);
    const t = di.resolve("t");

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validate,
        onSubmit: (values) => {
            // Handle form submission
        },
    });

    function validate(values) {
        const errors: any = {};
        if (!values.email) {
            errors.email = t('required');
        }
    }

    return (
        <AuthLayout title={createTitle(t('forgot-pass'))}>
            <h2 className="text-black mb-5 font-semibold text-lg lg:text-2xl lg:mb-10 xl:text-3xl xl:mb-12">
                {t("forgot-password")}
            </h2>
            <form className="space-y-6 w-[75%] sm:w-[40%]" onSubmit={formik.handleSubmit}>
                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-gray-900 lg:text-base xl:text-xl"
                        >
                            {t("field-email")}
                        </label>
                        <div className="text-sm lg:text-base xl:text-xl">
                            <Link
                                href="/"
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                {t("sign-in")}
                            </Link>
                        </div>
                    </div>
                    <div className="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Enter email"
                            onChange={formik.handleChange}
                            onBlur={(e) => {
                                if(e?.target?.value?.trim){
                                    const trimmedValue = e?.target?.value?.trim();
                                    formik.setFieldValue('email', trimmedValue);
                                }
                                formik.handleBlur(e);
                            }}
                            value={formik.values.email}
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 lg:text-base lg:py-3 xl:text-xl ${
                                formik.touched.email && formik.errors.email ? 'ring-red-500' : ''
                            }`}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-red-500 text-sm">{formik.errors.email as string}</div>
                        ) : null}
                    </div>
                </div>

                <div className="text-sm px-10 h-8 sm:h-10 lg:h-16 lg:text-xl lg:px-5 lg:py-3 xl:text-2xl xl:h-20">
                    <ButtonSubmitting actionType="GET" entityName={"identity"} translationLabel={"reset-password"}/>
                </div>
            </form>
        </AuthLayout>
    );
}
