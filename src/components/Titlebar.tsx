import React from 'react';
import { IconMinus, IconSquare, IconX } from '@tabler/icons-react';
import { ActionIcon, Box, Flex, Text } from '@mantine/core';

const TitleBar = () => {
  const handleMinimize = () => window.api.minimize();
  const handleMaximize = () => window.api.maximize();
  const handleClose = () => window.api.close();

  return (
    <Box 
      p={4} 
      sx={(theme) => ({
        background: theme.colors.dark[6],
        WebkitAppRegion: 'drag',
        height: '40px',
        position: "sticky",
        top: 0,
        zIndex: 1000
      })}
    >
      <Flex justify="space-between" align="center" h="100%">
        <Flex gap={2}>
            <Text ml={4}>VSM</Text>
            <Text ml={4} color="dimmed">1.2.0</Text>
        </Flex>
        <Flex gap={4} sx={{ WebkitAppRegion: 'no-drag' }}>
          <ActionIcon onClick={handleMinimize} sx={(theme) => ({
            background: theme.colors.dark[7],
            transition: "all 0.1s ease-in-out",
            '&:hover': {
                background: theme.colors.dark[8]
            }
          })}><IconMinus size={10} /></ActionIcon>
          <ActionIcon onClick={handleMaximize} sx={(theme) => ({
            background: theme.colors.dark[7],
            transition: "all 0.1s ease-in-out",
            '&:hover': {
                background: theme.colors.dark[8]
            }
          })}><IconSquare size={10} /></ActionIcon>
          <ActionIcon onClick={handleClose} sx={(theme) => ({
            background: theme.colors.dark[7],
            transition: "all 0.1s ease-in-out",
            '&:hover': {
                background: theme.colors.red[5]
            }
          })}><IconX size={10} /></ActionIcon>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TitleBar;