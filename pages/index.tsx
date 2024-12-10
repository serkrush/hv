
import container from "@/server/di/container";
import ContainerContext from "@/src/ContainerContext";
import AuthLayout from "@/src/components/layouts/AuthLayout";
import LoginForm from "@/src/components/loginForm";
import clientContainer from "@/src/di/clientContainer";
import { useAcl } from "@/src/hooks/useAcl";
import { createTitle } from "@/src/utils/createTitle";
import ReduxStore from "@/store/store";
import { useContext } from "react";

const redux = clientContainer.resolve<ReduxStore>("redux");

export default function Base() {
    const di = useContext(ContainerContext);
    const t = di.resolve("t");
    const acl = useAcl();
    //const router = useRouter();
    //const { autologin } = useActions("Identity");
    // useEffect(() => {
    //     autologin({ router });
    // }, []);

    // useEffect(() => {
    //     const subs = auth.onAuthStateChanged((user) => {
    //         if (user != null) {
    //             autologin({ router });
    //         }
    //     });
    //     return subs;
    // }, []);

    return (
        <AuthLayout title={createTitle(t('login'))}>
            <h2 className="text-black mb-5 font-semibold text-lg lg:text-2xl lg:mb-10 xl:text-3xl xl:mb-12">{t('welcome-message')}</h2>
            <LoginForm />
        </AuthLayout>
    );
}


export const getServerSideProps = redux.getServerSideProps(
    container,
    "/",
    "AuthController"
);