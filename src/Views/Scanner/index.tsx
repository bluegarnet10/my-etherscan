/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Box, Button, Card, makeStyles, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateFnsUtils from '@date-io/date-fns';

import HistoryTable from './HistoryTable';
import axios from 'axios';

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
	datePicker: {
		margin: '0 10px !important',
		width: '140px',
	},
}));

export interface Transaction {
	blockNumber: string;
	timeStamp: string;
	hash: string;
	from: string;
	contractAddress: string;
	to: string;
	value: string;
	gasUsed: string;
	tokenName?: string;
	tokenSymbol?: string;
	tokenDecimal?: string;
}

const Scanner = () => {
	const classes = useStyles();

	const [address, setAddress] = useState<string>('0xe0ac16e70f92cc068fca6de81d5edaa08fd612e1');
	const [startBlock, setStartBlock] = useState<string>('100000');
	const [transactions, setTransactions] = useState<Array<Transaction>>([]);
	const [tokenTransactions, setTokenTransactions] = useState<Array<Transaction>>([]);
	const [tabIndex, setTabIndex] = useState<number>(0);
	const [selectedDate, setSelectedDate] = useState<MaterialUiPickersDate>(new Date());
	const [balanceByDate, setBalanceByDate] = useState<string>('0');

	const handleSearch = () => {
		if (!address || !startBlock) {
			console.log('not valid');
			return;
		}

		axios
			.get(
				`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
			)
			.then(res => {
				setTransactions(res.data.result);
			})
			.catch(e => console.error(e));

		axios
			.get(
				`https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
			)
			.then(res => {
				setTokenTransactions(res.data.result);
			})
			.catch(e => console.error(e));
	};

	const handleTabChange = (_: any, newValue: number) => {
		setTabIndex(newValue);
	};

	// This feature requires the Etherscan PRO API Key.
	// As I used the normal API key, it will not work.
	// Once you change the REACT_APP_ETHERSCAN_API_KEY to a PRO key, it will work.
	const updateBalanceByDate = useCallback(() => {
		if (!selectedDate) {
			return;
		}

		const timestamp = Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate());
		if (transactions.length > 0) {
			const tx = transactions.find(item => item.timeStamp && Number(item.timeStamp) < timestamp);
			if (tx) {
				axios
					.get(
						`https://api.etherscan.io/api?module=account&action=balancehistory&address=${address}&blockno=${tx.blockNumber}&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
					)
					.then(res => {
						console.log(res);
					})
					.catch(e => {
						console.error(e);
					});
				return;
			}
		}
		setBalanceByDate('0');
	}, [selectedDate, transactions]);

	useEffect(() => {
		updateBalanceByDate();
	}, [transactions, selectedDate, updateBalanceByDate]);

	const getTotalAmount = () => {
		return transactions.reduce(
			(totalValue: BigNumber, item) => totalValue.add(BigNumber.from(item.value)),
			BigNumber.from(0)
		);
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
				<Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
					ETH Balance on{' '}
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<KeyboardDatePicker
							disableToolbar
							variant="inline"
							format="yyyy/MM/dd"
							margin="normal"
							id="date-picker-inline"
							value={selectedDate}
							onChange={date => setSelectedDate(date)}
							KeyboardButtonProps={{
								'aria-label': 'change date',
							}}
							className={classes.datePicker}
						/>
						is {balanceByDate} Ether
					</MuiPickersUtilsProvider>
				</Typography>
			</Card>

			<Card className={classes.card}>
				<Tabs value={tabIndex} onChange={handleTabChange} aria-label="tabs" className={classes.tabs}>
					<Tab label="Transactions" value={0} />
					<Tab label="ERC20 Token Txns" value={1} />
				</Tabs>
				<HistoryTable tokenView={tabIndex === 1} transactions={tabIndex === 0 ? transactions : tokenTransactions} />
			</Card>
		</Box>
	);
};

export default Scanner;
