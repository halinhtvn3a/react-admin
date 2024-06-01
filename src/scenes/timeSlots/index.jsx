import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Modal, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { fetchTimeSlots, createTimeSlot } from '../../api/timeSlotApi'; // Import hàm createTimeSlot mới
import Header from '../../components/Header';

const TimeSlots = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [timeSlotsData, setTimeSlotsData] = useState([]);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotId: '',
    courtId: '',
    slotDate: '',
    slotStartTime: '',
    slotEndTime: '',
    isAvailable: true,
  });

  useEffect(() => {
    const getTimeSlotsData = async () => {
      try {
        const data = await fetchTimeSlots();
        setTimeSlotsData(data);
      } catch (err) {
        setError('Failed to fetch time slots data');
      }
    };
    getTimeSlotsData();
  }, []);

  const handleEdit = (id) => {
    // Logic for edit action
    console.log(`Edit time slot with id: ${id}`);
  };

  const handleDelete = (id) => {
    // Logic for delete action
    console.log(`Delete time slot with id: ${id}`);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewSlot({ ...newSlot, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const addedSlot = await createTimeSlot(newSlot);
      setTimeSlotsData([...timeSlotsData, addedSlot]);
      handleClose();
    } catch (error) {
      console.error('Failed to create time slot:', error);
    }
  };

  const columns = [
    { field: 'slotId', headerName: 'Slot ID', flex: 1 },
    { field: 'courtId', headerName: 'Court ID', flex: 1 },
    { field: 'slotDate', headerName: 'Slot Date', flex: 1,
      renderCell: ({ row }) => (
        <Typography>{new Date(row.slotDate).toLocaleDateString()}</Typography>
      )
    },
    { field: 'slotStartTime', headerName: 'Start Time', flex: 1 },
    { field: 'slotEndTime', headerName: 'End Time', flex: 1 },
    { field: 'isAvailable', headerName: 'Availability', flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.isAvailable ? 'Available' : 'Unavailable'}</Typography>
      )
    },
    { field: 'paymentStatus', headerName: 'Payment Status', flex: 1,
      valueGetter: (params) => params.row.bookings && params.row.bookings.length > 0 ? params.row.bookings[0].payments[0].paymentStatus : 'N/A'
    },
    { field: 'userName', headerName: 'User Name', flex: 1,
      valueGetter: (params) => params.row.bookings && params.row.bookings.length > 0 ? params.row.bookings[0].user.userName : 'N/A'
    },
    { field: 'email', headerName: 'Email', flex: 1,
      valueGetter: (params) => params.row.bookings && params.row.bookings.length > 0 ? params.row.bookings[0].user.email : 'N/A'
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <Button 
            onClick={() => handleEdit(row.slotId)} 
            variant="contained" 
            size="small" 
            style={{ 
              marginRight: 8,
              backgroundColor: colors.greenAccent[400],
              color: colors.primary[900]
            }}
          >
            Edit
          </Button>
          <Button 
            onClick={() => handleDelete(row.slotId)} 
            variant="contained" 
            size="small" 
            style={{ 
              backgroundColor: colors.redAccent[400],
              color: colors.primary[900]
            }}
          >
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box m="20px">
      <Header title="TIME SLOTS" subtitle="List of Time Slots" />
      <Box display="flex" justifyContent="flex-end" m="20px 0">
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create New Slot
        </Button>
      </Box>
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <Box m="40px 0 0 0" height="75vh" sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none"
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300]
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none"
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400]
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700]
          }
        }}>
          <DataGrid
            rows={timeSlotsData}
            columns={columns}
            getRowId={(row) => row.slotId}
          />
        </Box>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box 
          display="flex" 
          flexDirection="column" 
          p="20px" 
          m="20px auto" 
          bgcolor="background.paper" 
          boxShadow={24} 
          width={400} 
          borderRadius={4}
        >
          <Typography variant="h6" mb="20px">Create New Slot</Typography>
          <TextField label="Slot ID" name="slotId" value={newSlot.slotId} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Court ID" name="courtId" value={newSlot.courtId} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Slot Date" name="slotDate" value={newSlot.slotDate} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Start Time" name="slotStartTime" value={newSlot.slotStartTime} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="End Time" name="slotEndTime" value={newSlot.slotEndTime} onChange={handleChange} fullWidth margin="normal" />
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>Create</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default TimeSlots;
