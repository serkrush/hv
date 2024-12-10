import Link from 'next/link';
import {useMemo} from 'react';
import BenchFoods from '@/public/benchfoods_logo.svg';
import Head from 'next/head';
import {useRouter} from 'next/router';
import Image from 'next/image';

const NotFoundPage = () => {
    const {back} = useRouter();
    const logoImg = useMemo(() => {
        return (
            <Image
                className="h-auto fill-black w-[200px] xl:w-[300px]"
                src={BenchFoods.src}
                alt="Benchfood logo"
                width={132}
                height={132}
            />
        );
    }, []);
    return (
        <>
            <Head>
                <title>Page 404</title>
            </Head>
            <div className="relative flex h-screen flex-col bg-gray-100 text-gray-800">
                <Link
                    href={'/'}
                    className="absolute flex w-full justify-start px-5 py-5">
                    {logoImg}
                </Link>
                <div className="flex flex-grow flex-col  items-center justify-center">
                    <h1 className="text-6xl font-bold text-red-500">404</h1>
                    <p className="mt-4 text-lg">
                        Oops! The page you’re looking for doesn’t exist.
                    </p>
                    <button
                        onClick={() => back()}
                        className="mt-6 rounded bg-gray-600 px-4 py-2 text-white transition  hover:bg-gray-400">
                        Go back
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
