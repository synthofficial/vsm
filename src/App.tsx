import React, { useEffect, useState } from 'react';
import { AccountProps } from './interfaces/Account';
import AccountCard from './components/AccountCard/AccountCard';
import Navigation from './components/Navigation';
import { Modal, Text, Progress, Button, Stack, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDownload, IconRefresh } from '@tabler/icons-react';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountProps[] | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [updateDetails, setUpdateDetails] = useState<{ newVersion: string; version: string }>();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.api.onUpdateAvailable((info) => {
      console.log('Update available:', info);
      if (info.update) {
        setUpdateDetails(info);
        open();
      }
    });
  
    window.api.onDownloadProgress((progress) => {
      console.log('Download progress:', progress?.percent || 0);
      setDownloadProgress(progress?.percent || 0);
    });
  
    window.api.onUpdateDownloaded(() => {
      console.log('Update downloaded');
      setIsDownloading(false);
    });
  
    window.api.checkUpdate();
    fetchAccounts();
  }, [open]); // Added open to dependencies

  const fetchAccounts = async () => {
    try {
      const data = await window.api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts(null);
    }
  };

  const handleUpdate = () => {
    setIsDownloading(true);
    window.api.startDownload();
  };

  const handleInstall = () => {
    window.api.quitAndInstall();
  };

  if (accounts === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">
          Could not find any accounts. Please add some on the bar below.
        </p>
        <Navigation />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
        {accounts.map((account) => (
          <div key={account.riotName}>
            <AccountCard 
              {...account}
              onAccountUpdate={fetchAccounts}
            />
          </div>
        ))}
      </div>
      <Navigation onAccountUpdate={fetchAccounts} />
      <Modal 
        opened={opened} 
        onClose={close} 
        centered 
        title="New Update Available" 
        closeOnClickOutside={false}
        withCloseButton={false}
        size="md"
      >
        <Stack p="md">
          <Text size="lg">A new version of the application is available.</Text>
          <Group dir="apart">
            <Text>Current Version:</Text>
            <Text fw={700}>{updateDetails?.version}</Text>
          </Group>
          <Group dir="apart">
            <Text>Latest Version:</Text>
            <Text fw={700}>{updateDetails?.newVersion}</Text>
          </Group>
          {isDownloading ? (
            <Stack p="xs">
              <Text size="sm">Downloading update...</Text>
              <Progress 
                value={downloadProgress} 
                aria-label={`${downloadProgress.toFixed(0)}%`} 
                size="xl" 
                radius="xl"
              />
            </Stack>
          ) : downloadProgress === 100 ? (
            <Button 
              leftSection={<IconRefresh size={20} />} 
              color="green" 
              onClick={handleInstall}
              fullWidth
            >
              Install and Restart
            </Button>
          ) : (
            <Button 
            leftSection={<IconDownload size={20} />} 
              onClick={handleUpdate}
              fullWidth
            >
              Download Update
            </Button>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default App;
