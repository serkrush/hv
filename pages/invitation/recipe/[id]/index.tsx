import container from '@/server/di/container';
import ContainerContext from '@/src/ContainerContext';
import { FaFail, FaSuccess } from '@/src/components/FaIcons/icons';
import RicipeShareForm from '@/src/components/Form/RicipeShareForm';
import SpinnerLoaderOverlay from '@/src/components/SpinnerLoaderOverlay';
import AuthLayout from '@/src/components/layouts/AuthLayout';
import { AppState, ENTITY, Flag } from '@/src/constants';
import clientContainer from '@/src/di/clientContainer';
import { IUserEntity, TCategoryEntities } from '@/src/entities/EntityTypes';
import ReduxStore from '@/store/store';
import { setFlagger } from '@/store/types/actionTypes';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
const redux = clientContainer.resolve<ReduxStore>("redux");

export default function Base() {
    // const acl = useAcl();
    const di = useContext(ContainerContext);
    const t = di.resolve('t');
    const router = useRouter();
    const dispatch = useDispatch();

    const invitations = useSelector((state: AppState) => {
        return state.invitations;
    });
    const categories: TCategoryEntities = useSelector(state => {
        return state[ENTITY.CATEGORIES];
    });

    const flagger = useSelector((state: AppState) => {
        return state.flagger;
    });

    const users = useSelector((state: AppState) => {
        return state.users;
    });

    const invitation = useMemo(() => {
        if (invitations && flagger && flagger[Flag.InvitationIdForConfirm]) {
            return invitations[flagger[Flag.InvitationIdForConfirm]];
        } else {
            return null;
        }
    }, [invitations, flagger]);

    const user: IUserEntity = useMemo(() => {
        if (invitation && invitation.receiverUserId) {
            return users[invitation.receiverUserId];
        } else if (invitation) {
            return {
                uid: '',
                firstName: invitation.receiverFirstName,
                lastName: invitation.receiverLastName,
                email: invitation.receiverEmail,
                timezone: invitation.senderTimeZone
            };
        } else {
            return null;
        }
    }, [invitation, users]);

    const invitationConfirmed = useMemo(() => {
        const confirmation = flagger[Flag.InviteRecipeConfirmedSuccess];
        return confirmation ? confirmation == invitation?.id : false;
    }, [flagger, invitation]);

    const invitationRejected = useMemo(() => {
        const confirmation = flagger[Flag.InviteRejectedSuccess];
        return confirmation ? confirmation == invitation?.id : false;
    }, [flagger, invitation]);

    const invitationInfoReceived = useMemo(() => {
        return flagger[Flag.InvitationInfoReceived];
    }, [flagger]);

    const invitationActualInfoReceived = useMemo(() => {
        return (
            invitationInfoReceived != undefined &&
            invitation != undefined &&
            invitation.id == invitationInfoReceived
        );
    }, [flagger, invitationInfoReceived, invitation]);

    useEffect(() => {
        const id = router?.query?.id;
        dispatch(setFlagger(Flag.InvitationIdForConfirm, null));

        if (id) {
            dispatch(setFlagger(Flag.InvitationInfoReceived, id));
            dispatch(setFlagger(Flag.InvitationIdForConfirm, id));
        }
    }, [router.isReady]);

    return (
        <AuthLayout>
            <div className='w-[95%] lg:w-[60%]'>
                {(!invitationInfoReceived ||
                (invitationInfoReceived && invitationActualInfoReceived)) &&
                !invitationConfirmed &&
                !invitationRejected && (
                    <>
                        <div className="flex flex-row ml-2">
                            <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                                {t('confirm-invitation-recipe-title')}
                            </h2>
                        </div>
                        <div className="flex flex-row mb-5 ml-2">
                            <h3 className="text-left text-base tracking-tight text-gray-900/80">
                                {t('confirm-invitation-recipe-desc')}
                            </h3>
                        </div>
                        {user && (
                            <div className="flex min-h-full flex-1 flex-col">
                                <RicipeShareForm
                                    invitation={invitation}
                                    categories={categories}
                                    user={user}
                                />
                            </div>
                        )}
                    </>
                )}
                {invitationConfirmed && (
                    <div className="mt-10 flex flex-col items-center justify-center gap-y-2 px-6 lg:px-8 lg:gap-4">
                        <FaSuccess className="w-[2rem] h-[2rem] sm:w-[3rem] sm:h-[3rem] lg:w-[4rem] lg:h-[4rem]" />
                        <h2 className="text-center w-[70%] mx-auto text-2xl font-bold leading-9 tracking-tight text-gray-900 xl:text-3xl">
                            {t('invite-confirmed-success')}
                        </h2>
                    </div>
                )}

                {invitationRejected && (
                    <div className="mt-10 flex flex-col items-center justify-center gap-y-2 px-6 lg:px-8 lg:gap-4">
                        <FaSuccess className="w-[2rem] h-[2rem] sm:w-[3rem] sm:h-[3rem] lg:w-[4rem] lg:h-[4rem]" />
                        <h2 className="text-center w-[70%] mx-auto text-2xl font-bold leading-9 tracking-tight text-gray-900 xl:text-3xl">
                            {t('invitation-rejected-success')}
                        </h2>
                    </div>
                )}
                
                {invitationInfoReceived && !invitationActualInfoReceived && (
                    <div className="mt-10 flex flex-col items-center justify-center gap-y-2 px-6 lg:px-8 lg:gap-4">
                        <FaFail className="w-[2rem] h-[2rem] sm:w-[3rem] sm:h-[3rem] lg:w-[4rem] lg:h-[4rem]" />
                        <h2 className="text-center w-[80%] mx-auto text-xl font-bold leading-9 tracking-tight text-gray-900 lg:text-2xl xl:text-3xl">
                            {t('invitation-not-found-title')}
                        </h2>
                    </div>
                )}
                <SpinnerLoaderOverlay
                    checkEntities={['InvitationEntity', 'UserEntity']}
                />
            </div>
        </AuthLayout>
    );
}

export const getServerSideProps = redux.getServerSideProps(
    container,
    "/invitation/recipe/:id",
    "InvitationController"
);
