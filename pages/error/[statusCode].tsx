import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {useMemo} from 'react';
import BenchFoods from '@/public/benchfoods_logo.svg';
import {HttpStatusData} from '@/http-status.config';
import { useTranslation } from 'react-i18next';

const ErrorPage = () => {
    const {t} = useTranslation();
    const router = useRouter();
    const {statusCode, message} = router.query;
    const {back} = useRouter();
    const logoImg = useMemo(() => {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                className="w-[10rem] fill-black lg:w-[12rem] xl:w-[18rem]"
                src={BenchFoods.src}
                alt="Benchfood logo"
            />
        );
    }, []);

    return (
        <>
            <Head>
                <title>
                    {statusCode || 'Oops!'} |{' '}
                    {t(HttpStatusData[statusCode + '_NAME'])}
                </title>
            </Head>
            <div className="relative flex h-screen flex-col bg-gray-100 text-gray-800">
                <Link
                    href={'/'}
                    className="absolute flex w-full justify-start px-5 py-5">
                    {logoImg}
                </Link>
                <div className="flex flex-grow flex-col  items-center justify-center mx-auto w-[80%] sm:w-[70%] lg:w-[50%] xl:w-[35%]">
                    <h1 className="text-4xl font-bold text-red-500 lg:text-5xl xl:text-6xl">
                        {statusCode || 'Oops!'}
                    </h1>
                    <p className="text-xl font-bold text-red-500 text-center lg:text-2xl xl:text-4xl">
                        {t(HttpStatusData[statusCode + '_NAME'])}
                    </p>
                    <p className="mt-4 text-base uppercase text-center lg:text-lg">
                        {message ? t(message) : t(HttpStatusData[statusCode + '_MESSAGE'])}
                    </p>
                    <button
                        onClick={() => back()}
                        className="mt-6 rounded bg-gray-600 px-4 py-2 text-white transition  hover:bg-gray-400">
                        {t('go-back')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ErrorPage;
