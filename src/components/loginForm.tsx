import React, { useContext } from "react";
import { useActions } from "@/src/hooks/useEntity";
import { useRouter } from "next/navigation";
import ContainerContext from "@/src/ContainerContext";
import { useFormik } from "formik";
import { ButtonSubmitting } from "./Form/ButtonSubmitting";

export default function LoginForm() {
    const router = useRouter();
    const { login } = useActions("Identity");
    const di = useContext(ContainerContext);
    const t = di.resolve("t");

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validate,
        onSubmit: (values) => {
            login({ email: values.email, password: values.password, router });
        },
    });

    function validate(values) {
        const errors: any = {};
        if (!values.email) {
            errors.email = t('required');
        }
    
        if (!values.password) {
            errors.password = t('required');
        }
        if (values.password) {
            if (values.password.length < 8) {
                errors.password = t('password-invalid-length-alert-message');
            }
        }
    }

    return (
        <form className="space-y-6 w-[75%] sm:w-[40%]" onSubmit={formik.handleSubmit}>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900 lg:text-base xl:text-xl"
                >
                    {t("field-email")}
                </label>
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
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 lg:text-base lg:py-3 xl:text-xl ${formik.touched.email && formik.errors.email ? 'ring-red-500' : ''}`}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-sm">{formik.errors.email as string}</div>
                    ) : null}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900 lg:text-base xl:text-xl"
                    >
                        {t("field-password")}
                    </label>
                    <div className="text-sm lg:text-base xl:text-xl">
                        <a
                            href="forgot"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            {t("forgot-password")}
                        </a>
                    </div>
                </div>
                <div className="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="Enter password"
                        onChange={formik.handleChange}
                        onBlur={(e) => {
                            if(e?.target?.value?.trim){
                                const trimmedValue = e?.target?.value?.trim();
                                formik.setFieldValue('password', trimmedValue);
                            }
                            formik.handleBlur(e);
                        }}
                        value={formik.values.password}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 lg:text-base lg:py-3 xl:text-xl ${formik.touched.password && formik.errors.password ? 'ring-red-500' : ''}`}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div className="text-red-500 text-sm">{formik.errors.password as string}</div>
                    ) : null}
                </div>
            </div>

            <div className="text-sm px-10 h-8 sm:h-10 lg:h-16 lg:text-xl lg:py-3 xl:text-2xl xl:h-20">
                <ButtonSubmitting actionType="GET" entityName={"identity"} translationLabel={"sign-in"}/>
            </div>
        </form>
    );
}
