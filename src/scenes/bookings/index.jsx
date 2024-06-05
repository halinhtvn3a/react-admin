import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchBookings, deleteBooking } from "../../api/bookingApi";
import Header from "../../components/Header";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Bookings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [bookingsData, setBookingsData] = useState([]);
  const query = useQuery();
  const navigate = useNavigate();

  const pageQuery = parseInt(query.get("pageNumber")) || 1;
  const sizeQuery = parseInt(query.get("pageSize")) || 10;

  const [page, setPage] = useState(pageQuery - 1); // Convert page index to 0-based for ReactPaginate
  const [pageSize, setPageSize] = useState(sizeQuery);
  const [rowCount, setRowCount] =  useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        const data = await fetchBookings(page + 1, pageSize); // Convert page index to 1-based
        console.log("Fetched bookings data:", data); // Log fetched data

        if (data.items && Array.isArray(data.items)) {
          const numberedData = data.items.map((item, index) => ({
            ...item,
            rowNumber: index + 1 + page * pageSize,
          }));
          setBookingsData(numberedData);
          setRowCount(data.totalCount);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (err) {
        setError(`Failed to fetch bookings data: ${err.message}`);
      }
    };
    getBookingsData();
  }, [page, pageSize]);

  const handlePageClick = (event) => {
    console.log("Page change:", event.selected); // Log new page index
    const newPage = event.selected;
    setPage(newPage);
    navigate(`/Bookings?pageNumber=${newPage + 1}&pageSize=${pageSize}`); // Update URL
  };

  const handlePageSizeChange = (event) => {
    console.log("Page size change:", event.target.value); // Log new page size
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(0); // Reset to first page when pageSize changes
    navigate(`/Bookings?pageNumber=1&pageSize=${newSize}`); // Update URL
  };

  const handleEdit = (id) => {
    console.log(`Edit booking with id: ${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setBookingsData((prevData) =>
        prevData.filter((booking) => booking.bookingId !== id)
      );
      console.log(`Booking with id ${id} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete booking with id ${id}:`, error);
      setError(`Failed to delete booking with id ${id}: ${error.message}`);
    }
  };

  return (
    <Box m="20px">
      <Header title="BOOKINGS" subtitle="List of Bookings" />
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: colors.blueAccent[700] }}>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Booking Time</TableCell>
                  <TableCell>Check</TableCell>
                  <TableCell>Payment Amount</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Slot ID</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData.length > 0 ? (
                  bookingsData.map((row) => (
                    <TableRow
                      key={row.bookingId}
                      style={
                        !row.check
                          ? {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? colors.redAccent[700]
                                  : colors.redAccent[700],
                              color: theme.palette.mode === "dark" ? colors.redAccent[100] : '#FFFFFF',
                            }
                          : null
                      }
                    >
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>
                        {new Date(row.bookingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(row.bookingDate).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{row.check ? "Yes" : "No"}</TableCell>
                      <TableCell>{row.paymentAmount}</TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.slotId || "N/A"}</TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => handleEdit(row.bookingId)}
                            variant="contained"
                            size="small"
                            style={{
                              marginRight: 8,
                              backgroundColor: colors.greenAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.bookingId)}
                            variant="contained"
                            size="small"
                            style={{
                              backgroundColor: colors.redAccent[400],
                              color: colors.primary[900],
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt="20px"
          >
            <Select value={pageSize} onChange={handlePageSizeChange}>
              {[10, 15, 20, 25, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(rowCount / pageSize)}
              previousLabel="< previous"
              renderOnZeroPageCount={null}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Bookings;
