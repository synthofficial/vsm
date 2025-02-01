import { GetBuddy, GetWeaponSkin } from "@/modules/API";
import { Tooltip, Image, Paper } from "@mantine/core";
import React, { useEffect, useState } from "react";

interface WeaponDisplayProps {
    weapon: any
}

export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({ weapon }) => {
    console.log(weapon);
    if (!weapon) return null;

    const [skin, setSkin] = useState<{ displayIcon: string, displayName: string, fullRender: string}>();
    const [buddy, setBuddy] = useState<{ displayIcon: string, displayName: string, fullRender: string}>();

    useEffect(() => {
        const fetchSkin = async() => {
            const data = await GetWeaponSkin(weapon.ChromaID);
            setSkin(data.data);
        }
        const fetchBuddy = async() => {
            const data = await GetBuddy(weapon.CharmID);
            setBuddy(data.data);
        }
        fetchSkin();
        fetchBuddy();
    }, [weapon])

    return (
        <Paper
            p="md"
            radius="md"
            w={120}
            h={75}
            sx={(theme) => ({
                backgroundColor: theme.colors.dark[9],
                border: `1px solid ${theme.colors.dark[4]}`,
                position: 'relative',
                '&:hover': {
                    backgroundColor: theme.colors.dark[8],
                    transition: 'background-color 200ms ease',
                }
            })}
        >
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <Tooltip
                    label={skin?.displayName || ''}
                    withArrow
                    position="top"
                    sx={(theme) => ({
                        backgroundColor: theme.colors.dark[8],
                        color: theme.white
                    })}
                >
                    <Image
                        src={skin?.displayIcon ?? skin?.fullRender}
                        alt={skin?.displayName}
                        fit="contain"
                        h="100%"
                        w="100%"
                        styles={{
                            image: {
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }
                        }}
                    />
                </Tooltip>
                {buddy?.displayIcon && (
                    <div style={{
                        position: 'absolute',
                        bottom: -12,
                        right: -12,
                        zIndex: 2
                    }}>
                        <Tooltip
                            label={buddy?.displayName || ''}
                            withArrow
                            position="bottom"
                            sx={(theme) => ({
                                backgroundColor: theme.colors.dark[8],
                                color: theme.white
                            })}
                        >
                            <Image
                                src={buddy.displayIcon}
                                alt={buddy.displayName}
                                w={24}
                                h={24}
                                fit="contain"
                                styles={{
                                    image: {
                                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                                    }
                                }}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
        </Paper>
    );
};

export default WeaponDisplay;