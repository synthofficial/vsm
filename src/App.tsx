import React, { useEffect, useState } from 'react';
import { AccountProps } from './interfaces/Account';
import AccountCard from './components/AccountCard/AccountCard';
import Navigation from './components/Navigation';
import { Grid } from '@mantine/core';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountProps[] | null>(null);

  useEffect(() => {

    //Check updates
    window.api.checkUpdate();

    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await window.api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts(null);
    }
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
    </>
  );
};

export default App;