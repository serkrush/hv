/* eslint-disable @next/next/no-img-element */
import BenchFoods from '@/public/benchfoods_logo.svg';
import LoginImage from '@/public/login_image.svg';
import Head from 'next/head';
import {useMemo} from 'react';

export default function AuthLayout({children, title = ""}) {
    const logoImg = useMemo(() => {
        return (
            <img
                className="h-auto w-48 fill-black sm:w-[300px] xl:w-[500px]"
                src={BenchFoods.src}
                alt="Benchfood logo"
            />
        );
    }, []);
    const leftSideImage = useMemo(() => {
        return (
            <img
                className="hidden h-auto w-full lg:block"
                src={LoginImage.src}
                alt="Benchfood"
            />
        );
    }, []);
    return (
        <div>
            {title && <Head><title>{title}</title></Head>}
            <div className="flex h-screen min-h-full flex-1 flex-col justify-start lg:flex-row lg:justify-center">
                <div className="flex h-[15%] w-full flex-col items-center justify-center lg:h-full lg:w-[40%] lg:justify-between lg:bg-black/20 lg:px-5">
                    <div className="flex items-center justify-center lg:h-[20%]">
                        {logoImg}
                    </div>
                    {leftSideImage}
                </div>
                <div className="flex h-[70%] flex-col items-center lg:h-full lg:w-[60%] lg:justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
