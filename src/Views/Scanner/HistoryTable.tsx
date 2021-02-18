import React, { FC, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import {
	makeStyles,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from '@material-ui/core';

import { Transaction } from '.';

const useStyles = makeStyles({
	table: {
		width: '100%',
	},
	address: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
});

interface Props {
	tokenView: boolean;
	transactions: Array<Transaction>;
}

const HistoryTable: FC<Props> = ({ tokenView, transactions }) => {
	const classes = useStyles();

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	useEffect(() => {
		setPage(0);
	}, [transactions]);

	const handleChangePage = (_: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table className={classes.table} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell>Txn Hash</TableCell>
							{!tokenView && <TableCell>Block</TableCell>}
							<TableCell>Date/Time</TableCell>
							<TableCell>From</TableCell>
							<TableCell>To</TableCell>
							<TableCell>Value</TableCell>
							{!tokenView && <TableCell>Txn Free</TableCell>}
							{tokenView && <TableCell>Token</TableCell>}
						</TableRow>
					</TableHead>

					<TableBody>
						{transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
							<TableRow key={row.hash}>
								<TableCell className={classes.address}>{row.hash}</TableCell>
								{!tokenView && <TableCell>{row.blockNumber}</TableCell>}
								<TableCell>{row.timeStamp && new Date(Number(row.timeStamp) * 1000).toLocaleString()}</TableCell>
								<TableCell className={classes.address}>{row.from.toLowerCase()}</TableCell>
								<TableCell className={classes.address}>{row.to.toLowerCase()}</TableCell>
								<TableCell>
									{!tokenView
										? `${ethers.utils.formatEther(row.value)} Ether`
										: `${ethers.utils.formatEther(
												BigNumber.from(row.value).mul(BigNumber.from(10).pow(18 - Number(row.tokenDecimal || '18')))
										  )}`}
								</TableCell>
								{!tokenView && (
									<TableCell>{ethers.utils.formatEther(BigNumber.from(row.gasUsed).mul(1e9))} Ether</TableCell>
								)}
								{tokenView && (
									<TableCell>
										{row.tokenName} ({row.tokenSymbol})
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				rowsPerPageOptions={[10, 20, 50]}
				component="div"
				count={transactions.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</>
	);
};

export default HistoryTable;
