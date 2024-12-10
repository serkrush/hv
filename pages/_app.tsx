import "@/styles/globals.css";
// import '@/styles/adaptiveTable.scss';

import "@/src/utils/i18n";

import ErrorPage from "next/error";
import { Provider } from "react-redux";

import clientContainer from "src/di/clientContainer";
import ReduxStore from "store/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import ContainerContext from "src/ContainerContext";
const redux = clientContainer.resolve<ReduxStore>("redux");

import SpinnerLayout from "@/src/components/SpinnerLayout";
import { persistStore } from "redux-persist";
import Head from "next/head";

const firebase = clientContainer.resolve("Firebase");
firebase.init();

export default function App({ Component, router, ...rest }) {
    const { store, props } = redux._wrapper.useWrappedStore(rest);
    redux.setStore(store);
    const persistor = persistStore(store);
    const pageProps = props.pageProps;

    if (pageProps?.data?.error) {
        return <ErrorPage statusCode={pageProps?.data?.error?.code ?? 404} />;
    }

    let component = <Component {...pageProps} />;

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <ToastContainer />
                <ContainerContext.Provider value={clientContainer}>
                    <Provider store={store}>
                        <PersistGate
                            loading={null}
                            persistor={persistor}
                            onBeforeLift={() => {}}
                        >
                            {/* <SpinnerLayout>{component}</SpinnerLayout> */}
                            {component}
                        </PersistGate>
                    </Provider>
                </ContainerContext.Provider>
            </div>
        </> 
    );
}
