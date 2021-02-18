import React, { FC, useState } from 'react';
import { ethers } from 'ethers';
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
	transactions: Array<ethers.providers.TransactionResponse>;
}

const HistoryTable: FC<Props> = ({ transactions }) => {
	const classes = useStyles();

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

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
							<TableCell>Block</TableCell>
							<TableCell>Date/Time</TableCell>
							<TableCell>From</TableCell>
							<TableCell>To</TableCell>
							<TableCell>Value</TableCell>
							<TableCell>Txn Fee</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
							<TableRow key={row.hash}>
								<TableCell className={classes.address}>{row.hash}</TableCell>
								<TableCell>{row.blockNumber}</TableCell>
								<TableCell>{row.timestamp && new Date(row.timestamp * 1000).toLocaleString()}</TableCell>
								<TableCell className={classes.address}>{row.from.toLowerCase()}</TableCell>
								<TableCell className={classes.address}>{row.to?.toLowerCase()}</TableCell>
								<TableCell>{ethers.utils.formatEther(row.value)} Ether</TableCell>
								<TableCell>{ethers.utils.formatEther(row.gasPrice.mul(row.gasLimit))} Ether</TableCell>
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
