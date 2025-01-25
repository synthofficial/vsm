import { Tooltip, Image, Paper } from "@mantine/core";
import React from "react";

interface WeaponDisplayProps {
    weapon?: {
        displayIcon?: string;
        displayName?: string;
        fullRender?: string;
        buddy?: {
            displayIcon?: string;
            displayName?: string;
            fullRender?: string;
        }
    }
}

export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({ weapon }) => {
    if (!weapon) return null;

    return (
        <Paper
            p="md"
            radius="md"
            w={120}
            h={60}
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
                    label={weapon?.displayName || ''}
                    withArrow
                    position="top"
                    sx={(theme) => ({
                        backgroundColor: theme.colors.dark[8],
                        color: theme.white
                    })}
                >
                    <Image
                        src={weapon?.displayIcon ?? weapon?.fullRender}
                        alt={weapon?.displayName}
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
                {weapon?.buddy?.displayIcon && (
                    <div style={{
                        position: 'absolute',
                        bottom: -12,
                        right: -12,
                        zIndex: 2
                    }}>
                        <Tooltip
                            label={weapon.buddy?.displayName || ''}
                            withArrow
                            position="bottom"
                            sx={(theme) => ({
                                backgroundColor: theme.colors.dark[8],
                                color: theme.white
                            })}
                        >
                            <Image
                                src={weapon.buddy.displayIcon}
                                alt={weapon.buddy.displayName}
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