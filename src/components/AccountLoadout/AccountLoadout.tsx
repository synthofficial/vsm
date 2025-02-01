import { AccountProps } from "@/interfaces/Account";
import { Flex, Grid, Image, Modal, Stack } from "@mantine/core";
import WeaponDisplay from "../WeaponDisplay/WeaponDisplay";
import { Weapons } from "@/interfaces/Weapons";
import { useEffect, useState } from "react";
import GetPlayerCard from "@/modules/API";

interface AccountLoadoutProps{
    open: () => void;
    onClose : () => void;
    opened : boolean;
    account: AccountProps;
}

const AccountLoadout : React.FC<AccountLoadoutProps> = ({ open, opened, account, onClose }) => {

    const [playerCard, setPlayerCard] = useState<{displayName: string, displayIcon: string, largeArt: string}>();

    useEffect(() => {
        const fetchPlayerCard = async() => {
            const data = await GetPlayerCard(account.loadout.Identity.PlayerCardID);
            setPlayerCard(data.data);
        }
        fetchPlayerCard();
    }, [account])

    return(
        <Modal opened={opened} onClose={onClose} title={`${account.riotName}#${account.riotTag}'s Loadout`} centered size="xl">
            <Flex gap={24}>
                {/* Left Side */}
                <Stack gap={4}>
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Classic)} />
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Shorty)} />
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Frenzy)} />
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Ghost)} />
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Sheriff)} />
                </Stack>
                {/* Middle Section */ }
                <Stack gap={32}>
                    <Stack gap={4}>
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Stinger)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Spectre)} />
                    </Stack>
                    <Stack gap={4}>
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Bucky)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Judge)} />
                    </Stack>
                </Stack>
                <Stack gap={32}>
                    <Stack gap={4}>
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Bulldog)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Guardian)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Phantom)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Vandal)} />
                    </Stack>
                    <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Knife)} />
                </Stack>
                { /* Right Section */ }
                <Stack gap={32}>
                    <Stack gap={4}>
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Marshal)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Outlaw)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Operator)} />
                    </Stack>
                    <Stack gap={4}>
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Ares)} />
                        <WeaponDisplay weapon={account.loadout.Guns.find(gun => gun.ID === Weapons.Odin)} />
                    </Stack>
                </Stack>
                <Image 
                        src={playerCard?.largeArt}
                        alt={account.riotName}
                        maw={150}
                        fit="contain"
                    />
            </Flex>
        </Modal>
    )
}

export default AccountLoadout;