import { IMachine } from "@/server/models/Machine";
import { TMachineAccess } from "@/server/models/MachineAccess";
import { TMachineGroup } from "@/server/models/MachineGroup";
import { TUser } from "@/server/models/User";
import { AppState, ENTITY, SHORT_GUID_LENGTH } from "@/src/constants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Input from "../../Form/Input";
import Multiselect from "../../Form/Multiselect";
import SimpleTable from "./SimpleTable";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { FaEye } from "../../FaIcons/icons";

export default function MachinesReview({machine}: {machine: IMachine}) {
    const {t} = useTranslation();
    const groups: TMachineGroup = useSelector((state: AppState) => state[ENTITY.MACHINE_GROUPS])
    const access: TMachineAccess = useSelector((state: AppState) => state[ENTITY.MACHINE_ACCESS])
    const users: TUser = useSelector((state: AppState) => state[ENTITY.USERS])
    
    const zones = useMemo(() => {
        return machine?.zones ? machine.zones.map(item => {
            return {
                label: item.zone.toUpperCase(),
                value: item,
            }
        }) : []
    }, [machine])

    const relatedGroups = useMemo(() => {
        return Object.values(groups).filter(item => {
            return item.machineIds.includes(machine?.id ?? "")
        })
    }, [groups, machine]);

    const relatedAccess: any = useMemo(() => {
        const accesses = Object.values(access).filter(item => {
            return item?.machineId ? item.machineId === machine?.id : false
        })
        return accesses.map(item => {
            const relatedUser = users[item.userId];
            return {
                userName: `${relatedUser.firstName} ${relatedUser.lastName}`,
                email: relatedUser.email,
                role: relatedUser?.role ?? t('no-info'),
                permissionLevel: item.permissionLevel,
            } 
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [access, machine]);

    const owner = useMemo(() => {
        return users[machine?.ownerId ?? ""]
    }, [users, machine])

    const handleShow = async () => {
        if(!machine?.id || !machine?.proofOfPurchaseFile) return;
        
        const filePath = `machines/${machine.id}/proof/${machine.proofOfPurchaseFile}`;
        try {
            const storage = getStorage();
            const fileRef = ref(storage, filePath);
            const url = await getDownloadURL(fileRef);
    
            const link = document.createElement('a');
            link.href = url;
            link.download = filePath.split('/').pop() || 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return <div className="w-full text-gray-900">
        <div className="grid lg:grid-cols-2 gap-x-2 gap-y-5">
            <Input
                name="id"
                value={machine?.id || t('no-info')}
                placeholder={t('id')}
                required={false}
                readOnly
                label={t('id')}
            />
            <Input
                name="machine-id"
                value={machine?.guid?.slice(SHORT_GUID_LENGTH)?.toUpperCase() || t('no-info')}
                placeholder={t('machine-id')}
                required={false}
                readOnly
                label={t('machine-id')}
            />
            <Input
                name="modelId"
                value={machine?.modelId || t('no-info')}
                placeholder={t('model-name')}
                required={false}
                readOnly
                label={t('model-name')}
            />
            <Input
                name="state"
                value={machine?.state || t('no-info')}
                placeholder={t('machine-state')}
                required={false}
                readOnly
                label={t('machine-state')}
            />
        
            <Input
                name="ownerName"
                value={`${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`}
                placeholder={t('owner-name')}
                required={false}
                readOnly
                label={t('owner-name')}
            />
            <Input
                name="machineName"
                value={machine?.machineName || t('no-info')}
                placeholder={t('machine-name')}
                required={false}
                readOnly
                label={t('machine-name')}
            />
            <Input
                name="machineType"
                value={machine?.machineType || t('no-info')}
                placeholder={t('machine-type')}
                required={false}
                readOnly
                label={t('machine-type')}
            />
            {zones?.length ? <Multiselect
                name="zones"
                options={[]}
                value={zones}
                onChange={value => {
                
                }}
                required={
                    false
                }
                readOnly
                label={t('zones-name')}
                containerMargin=""
            /> : <></>}
            <Input
                name="costPerKwh"
                value={machine?.costPerKwh || t('no-info')}
                placeholder={t('cost-per-kwh')}
                required={false}
                readOnly
                label={t('cost-per-kwh')}
            />
            <Input
                name="country"
                value={machine?.country || t('no-info')}
                placeholder={t('country')}
                required={false}
                readOnly
                label={t('country')}
            />
            <Input
                name="language"
                value={machine?.language || t('no-info')}
                placeholder={t('language')}
                required={false}
                readOnly
                label={t('language')}
            />
            <Input
                name="scale"
                value={machine?.scale || t('no-info')}
                placeholder={t('scale')}
                required={false}
                readOnly
                label={t('scale')}
            />
            <Input
                name="timezone"
                value={machine?.timezone || t('no-info')}
                placeholder={t('timezone')}
                required={false}
                readOnly
                label={t('timezone')}
            />
            {machine?.fanSpeed && <div className="flex gap-3">
                {machine?.fanSpeed[0]?.id && <Input
                    name="fanSpeed[0]"
                    value={machine?.fanSpeed[0]?.id || t('no-info')}
                    placeholder={t('fanSpeed')}
                    required={false}
                    readOnly
                    label={t('fanSpeed') + " - 1"}
                />}
                {machine?.fanSpeed[1]?.id &&<Input
                    name="fanSpeed[1]"
                    value={machine?.fanSpeed[1]?.id || t('no-info')}
                    placeholder={t('fanSpeed')}
                    required={false}
                    readOnly
                    label={t('fanSpeed') + " - 2"}
                />}
                {machine?.fanSpeed[2]?.id &&<Input
                    name="fanSpeed[2]"
                    value={machine?.fanSpeed[2]?.id || t('no-info')}
                    placeholder={t('fanSpeed')}
                    required={false}
                    readOnly
                    label={t('fanSpeed') + " - 3"}
                />}
            </div>}
            <Input
                name="weightScaleFeature"
                value={machine?.weightScaleFeature ? "Available" : "Off"}
                placeholder={t('weightScaleFeature')}
                required={false}
                readOnly
                label={t('weightScaleFeature')}
            />
            <Input
                name="heatingIntensity"
                value={machine?.heatingIntensity ?? t('no-info')}
                placeholder={t('heatingIntensity')}
                required={false}
                readOnly
                label={t('heatingIntensity')}
            />
            <Input
                name="currencySymbol"
                value={machine?.currencySymbol ?? t('no-info')}
                placeholder={t('currency-symbol')}
                required={false}
                readOnly
                label={t('currency-symbol')}
            />
            <div className="flex gap-x-2 w-full">
                <div className="w-full">
                    <Input
                        name="proofOfPurchaseDate"
                        value={machine?.proofOfPurchaseDate || t('no-info')}
                        placeholder={t('proof-of-purchase-date')}
                        required={false}
                        readOnly
                        label={t('proof-of-purchase-date')}
                    />
                </div>
                <div className="w-full">
                    <Input
                        name="proofOfPurchaseFile"
                        value={machine?.proofOfPurchaseFile || t('no-info')}
                        placeholder={t('proof-of-purchase-file')}
                        required={false}
                        readOnly
                        label={t('proof-of-purchase-file')}
                    />
                </div>
                {machine?.proofOfPurchaseFile && <div>
                    <button
                        onClick={handleShow}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <FaEye className="w-[1.25rem] h-[1.25rem]"/>
                    </button>
                </div>}
            </div>
            
        </div>
        <div className={`grid lg:grid-cols-2 gap-x-2 gap-y-5 mt-5`}>
            <SimpleTable data={relatedAccess as any} 
                columns={[{
                    key: 'userName',
                    label: t('user-name')
                }, {
                    key: 'email',
                    label: t('email')
                },{
                    key: 'role',
                    label: t('role')
                },{
                    key: 'permissionLevel',
                    label: t('permission-level')
                }]} 
                title={t('user-access')}
                emptyTitle={t('no-user-accesses')}
            />
            <SimpleTable data={relatedGroups as any} 
                columns={[{
                    key: 'name',
                    label: t('group-name')
                }]} 
                title={t('groups')}
                emptyTitle={t('no-groups')}
            />
        </div>
    </div>
}