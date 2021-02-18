import React, { useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Box, Button, Card, makeStyles, Tab, Tabs, TextField, Typography } from '@material-ui/core';

import HistoryTable from './HistoryTable';

const provider = new ethers.providers.EtherscanProvider(
	process.env.REACT_APP_NETWORK,
	process.env.REACT_APP_ETHERSCAN_API_KEY
);

const useStyles = makeStyles(() => ({
	root: {
		width: '100vw',
		minHeight: '100vh',
		padding: '10px 20px',
		boxSizing: 'border-box',
		background: 'whitesmoke',
	},
	card: {
		width: '100%',
		padding: '10px 20px',
		margin: '20px 0',
		boxSizing: 'border-box',
	},
	input: {
		width: '100%',
		margin: '10px 0',
	},
	tabs: {
		marginBottom: '10px',
	},
}));

const Scanner = () => {
	const classes = useStyles();

	const [address, setAddress] = useState<string>('0xe0ac16e70f92cc068fca6de81d5edaa08fd612e1');
	const [startBlock, setStartBlock] = useState<string>('100000');
	const [transactions, setTransactions] = useState<Array<ethers.providers.TransactionResponse>>([]);
	const [tabIndex, setTabIndex] = useState<number>(0);

	const handleSearch = () => {
		if (!address || !startBlock) {
			console.log('not valid');
			return;
		}

		provider
			.getHistory(address, startBlock)
			.then(res => {
				setTransactions(res.reverse());
			})
			.catch(error => {
				console.error(`ethClient getHistory error`, error);
			});
	};

	const handleTabChange = (_: any, newValue: number) => {
		setTabIndex(newValue);
	};

	const getTotalAmount = () => {
		return transactions.reduce((totalValue: BigNumber, item) => totalValue.add(item.value), BigNumber.from(0));
	};

	return (
		<Box className={classes.root}>
			<Card className={classes.card}>
				<TextField
					className={classes.input}
					label="Address"
					value={address}
					onChange={e => setAddress(e.target.value)}
				/>
				<TextField
					className={classes.input}
					label="Start Block"
					value={startBlock}
					onChange={e => setStartBlock(e.target.value)}
				/>
				<Button color="primary" variant="contained" onClick={handleSearch}>
					Search
				</Button>
			</Card>

			<Card className={classes.card}>
				<Typography variant="h6">
					ETH associated with transactions: {ethers.utils.formatEther(getTotalAmount())} Ether
				</Typography>
			</Card>

			<Card className={classes.card}>
				<Tabs value={tabIndex} onChange={handleTabChange} aria-label="tabs" className={classes.tabs}>
					<Tab label="Transactions" value={0} />
					<Tab label="ERC20 Token Txns" value={1} />
				</Tabs>
				<HistoryTable
					transactions={
						tabIndex === 0
							? transactions
							: transactions.filter(tx => tx.data.substring(0, 10).toLowerCase() === '0xa9059cbb')
					}
				/>
			</Card>
		</Box>
	);
};

export default Scanner;
