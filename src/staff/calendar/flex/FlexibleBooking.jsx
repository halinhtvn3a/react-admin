import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Select, MenuItem, FormControl, IconButton } from "@mui/material";
import { fetchBranchById } from "../../../api/branchApi";
import dayjs from 'dayjs';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchPrice } from '../../../api/priceApi';

dayjs.extend(isSameOrBefore);

// quy ước các ngày trong tuần thành số
const dayToNumber = {
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
  "Sunday": 7
}; 

//trả về mảng 2 cái ngày bắt đầu và kết thúc dạng số
const parseOpenDay = (openDay) => {
  if (!openDay || typeof openDay !== 'string') {
    console.error('Invalid openDay:', openDay);
    return [0, 0];
  }
  const days = openDay.split(' to ');
  if (days.length !== 2) {
    console.error('Invalid openDay format:', openDay);
    return [0, 0];
  }
  const [startDay, endDay] = days;
  return [dayToNumber[startDay], dayToNumber[endDay]];

};


// tạo ra mảng các ngày trong tuần
const getDaysOfWeek = (startOfWeek, openDay) => {
  let days = [];
  const [startDay, endDay] = parseOpenDay(openDay);
  if (startDay === 0 || endDay === 0) {
    console.error('Invalid days parsed:', { startDay, endDay });
    return days;
  }

  for (var i = startDay; i <= endDay; i++) {

    days.push(dayjs(startOfWeek).add(i, 'day'));

  }

  return days;
};


// hàm generate các slot từ openTime đến closeTime
const generateTimeSlots = (openTime, closeTime) => {
  let slots = [];
  for (let hour = openTime; hour < closeTime; hour++) {
    const start = formatTime(hour);
    const end = formatTime(hour + 1);
    slots.push(`${start} - ${end}`);
  }
  return slots;
};

const formatTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes}`;
};

const timeStringToDecimal = (timeString) => {
  const date = new Date(`1970-01-01T${timeString}Z`);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return hours + minutes / 60 + seconds / 3600;
};

const FlexibleBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, numberOfSlot, branchId } = location.state;

  const [branch, setBranch] = useState(null);
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf('week'));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);



  useEffect(() => {
    // Fetch branch details
    const fetchBranchDetails = async () => {
      try {
        const response = await fetchBranchById(branchId);
        setBranch(response);
      } catch (error) {
        console.error('Error fetching branch data:', error);
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  useEffect(() => {
    if (branch) {
      // Parse open days and generate days of the week and time slots
      const days = getDaysOfWeek(startOfWeek, branch.openDay);
      setWeekDays(days);

      const slots = generateTimeSlots(timeStringToDecimal(branch.openTime), timeStringToDecimal(branch.closeTime));
      setTimeSlots(slots);
    }
  }, [branch, startOfWeek]);

  // Function to convert time string to decimal
  const timeStringToDecimal = (timeString) => {
    const date = new Date(`1970-01-01T${timeString}Z`);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return hours + minutes / 60;
  };

  const generateTimeSlots = (openTime, closeTime) => {
    let slots = [];
    for (let hour = openTime; hour < closeTime; hour++) {
      const start = formatTime(hour);
      const end = formatTime(hour + 1);
      slots.push(`${start} - ${end}`);
    }
    return slots;
  };

  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const handleSlotClick = (slot, day) => {
    const slotId = `${day.format('YYYY-MM-DD')}_${slot}`;
    const isSelected = selectedSlots.some(selectedSlot => selectedSlot.slotId === slotId);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(selectedSlot => selectedSlot.slotId !== slotId));
    } else {
      if (selectedSlots.length < numberOfSlot) {
        setSelectedSlots([...selectedSlots, { slotId, slot, day }]);
      } else {
        alert(`You can select up to ${numberOfSlot} slots only`);
      }
    }
  };

  const handleRemoveSlot = (slotId) => {
    setSelectedSlots(selectedSlots.filter(selectedSlot => selectedSlot.slotId !== slotId));
  };

  const handlePreviousWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
  };

  const handleContinue = () => {
    // Process the slots and navigate to the next step
    const bookingRequests = selectedSlots.map((slot) => {
      const { day, slot: timeSlot } = slot;
      return {
        slotDate: day.format('YYYY-MM-DD'),
        timeSlot: {
          slotStartTime: `${timeSlot.split(' - ')[0]}:00`,
          slotEndTime: `${timeSlot.split(' - ')[1]}:00`,
        }
      };
    });

    navigate("/staff/PaymentDetail", {
      state: {
        userId,
        branchId,
        bookingRequests,
      }
    });
  };

  return (
    <Box m="20px" className="max-width-box" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
          Booking for User ID: {userId}
        </Typography>
        <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
          Branch ID: {branchId}
        </Typography>
        <Box display="flex" alignItems="center" sx={{ backgroundColor: "#E0E0E0", p: 1, borderRadius: 2 }}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ArrowBackIosIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
            From {dayjs(startOfWeek).add(1, 'day').format('D/M')} To {dayjs(startOfWeek).add(7, 'day').format('D/M')}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      {weekDays.map((day, dayIndex) => (
        <Grid container spacing={2} key={dayIndex} alignItems="center">
          <Grid item xs={1} padding= "8px">
            <Box
              sx={{
                backgroundColor: "#0D61F2",
                color: "white",
                width: "100%",
                textAlign: "center",
                padding: "8px",
                borderRadius: "4px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                
              }}
            >
              <Typography variant="body2" component="div">
                {day.format('ddd')}
              </Typography>
              <Typography variant="body2" component="div">
                {day.format('D/M')}
              </Typography>
            </Box>
          </Grid>

          {timeSlots.map((slot, slotIndex) => {
            const slotId = `${day.format('YYYY-MM-DD')}_${slot}`;
            const isSelected = selectedSlots.some(selectedSlot => selectedSlot.slotId === slotId);

            return (
              <Grid item xs key={slotIndex}>
                <Button
                  onClick={() => handleSlotClick(slot, day)}
                  sx={{
                    backgroundColor: isSelected ? "#1976d2" : "#D9E9FF",
                    color: isSelected ? "#FFFFFF" : "#0D1B34",
                    p: 2,
                    borderRadius: 2,
                    width: "100%",
                    textTransform: "none",
                    border: isSelected ? '2px solid #0D61F2' : '1px solid #90CAF9',
                    textAlign: 'center',
                    marginBottom: '16px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  m="10px"
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: isSelected ? "#FFFFFF" : "#0D1B34"
                      }}
                    >
                      {slot}
                    </Typography>
                    {isSelected && (
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleRemoveSlot(slotId); }}
                        sx={{
                          position: 'absolute',
                          top: 5,
                          left: 5,
                          backgroundColor: '#FFFFFF',
                          color: '#1976d2',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        -
                      </IconButton>
                    )}
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      ))}

      <Box display="flex" justifyContent="end" mt={1} marginRight={'12px'}>
        <Button
          variant="contained"
          sx={{
            color: "#FFFFFF",
            backgroundColor: "#1976d2",
            ':hover': {
              backgroundColor: '#1565c0',
            },
            ':active': {
              backgroundColor: '#1976d2',
            },
          }}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default FlexibleBooking;
