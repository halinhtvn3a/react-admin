import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Stepper, Step, StepLabel, Typography, Divider, Grid, TextField } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { fetchUserDetailByEmail, fetchUserDetail } from '../../api/userApi';
import { generatePaymentToken, processPayment } from '../../api/paymentApi';
import LoadingPage from './LoadingPage';
import { reserveSlots } from '../../api/bookingApi';

const theme = createTheme({
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'black',
          '&.Mui-checked': {
            color: 'black',
          },
        },
      },
    },
  },
});

const steps = ['Payment Details', 'Payment Confirmation'];

const PaymentDetailFixed = () => {
  const location = useLocation();
  const {
    branchId,
    bookingRequests,
    totalPrice,
    userId,
    numberOfMonths,
    daysOfWeek,
    startDate,
    slotStartTime,
    slotEndTime
  } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state.userInfo) {
      setUserInfo(location.state.userInfo);
      setUserExists(true);
    }
  }, [location.state.userInfo]);

  const handleEmailCheck = async () => {
    if (!email) {
      setErrorMessage('Please enter an email.');
      return;
    }

    try {
      const userData = await fetchUserDetailByEmail(email);
      if (userData && userData.length > 0) {
        const user = userData[0];
        const detailedUserInfo = await fetchUserDetail(user.id);
        if (detailedUserInfo) {
          setUserExists(true);
          setUserInfo({
            userId: user.id,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: detailedUserInfo.fullName,
            balance: detailedUserInfo.balance,
            address: detailedUserInfo.address,
          });
          setErrorMessage('');
        } else {
          setUserExists(false);
          setUserInfo(null);
          setErrorMessage('User details not found.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('User does not exist. Please register.');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      setErrorMessage('Error checking user existence. Please try again.');
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && !userExists) {
      setErrorMessage('Please enter a valid email and check user existence.');
      return;
    }

    if (activeStep === 0) {
      setIsLoading(true); // Hiển thị trang loading
      try {
        const bookingForm = bookingRequests.map((request) => ({
          courtId: null,
          branchId: branchId,
          slotDate: request.slotDate,
          timeSlot: {
            slotStartTime: request.timeSlot.slotStartTime,
            slotEndTime: request.timeSlot.slotEndTime,
          },
        }));

        console.log('Formatted Requests:', bookingForm);

        const booking = await reserveSlots(userInfo.userId, bookingForm);
        const bookingId = booking.bookingId;
        const tokenResponse = await generatePaymentToken(bookingId);
        const token = tokenResponse.token;
        const paymentResponse = await processPayment(token);
        const paymentUrl = paymentResponse;

        window.location.href = paymentUrl;
      } catch (error) {
        console.error('Error processing payment:', error);
        setErrorMessage('Error processing payment. Please try again.');
        setIsLoading(false); // Ẩn trang loading nếu có lỗi
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {!userExists && (
              <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="black">
                  Customer Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: '10px', marginRight: '10px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button variant="contained" color="primary" onClick={handleEmailCheck}>
                    Check
                  </Button>
                </Box>
                {errorMessage && (
                  <Typography variant="body2" color="error">
                    {errorMessage}
                  </Typography>
                )}
                {userExists && userInfo && (
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, marginTop: '20px' }}>
                    <Typography variant="h6" color="black">
                      <strong>Username:</strong> {userInfo.userName ? userInfo.userName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Full Name:</strong> {userInfo.fullName ? userInfo.fullName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Phone:</strong> {userInfo.phoneNumber ? userInfo.phoneNumber : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Coin:</strong> {userInfo.balance ? userInfo.balance : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Phương thức thanh toán và thông tin hóa đơn */}
            <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
                    <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
                      <PaymentIcon sx={{ marginRight: '8px' }} /> Payment Method
                    </Typography>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: 'black' }}>Select Payment Method</FormLabel>
                      <RadioGroup aria-label="payment method" name="paymentMethod">
                        <FormControlLabel value="cash" control={<Radio />} label="Cash" sx={{ color: 'black' }} />
                        <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" sx={{ color: 'black' }} />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="black">
                      Bill
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Branch ID:</strong> {branchId} {/* Thêm để hiển thị Branch ID */}
                    </Typography>
                    <Typography variant="h6" color="black" sx={{ marginTop: '20px' }}>
                      <strong>Number of Months:</strong> {numberOfMonths}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Day of Week:</strong> {daysOfWeek.join(', ')}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Start Date:</strong> {startDate}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Slot Start Time:</strong> {slotStartTime}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Slot End Time:</strong> {slotEndTime}
                    </Typography>
                    <Divider sx={{ marginY: '10px' }} />
                    <Typography variant="h6" color="black">
                      <strong>Total Price:</strong> {totalPrice} USD {/* Thêm để hiển thị tổng giá */}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );
      case 1:
        return <LoadingPage />; // Hiển thị trang loading
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box m="20px" p="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="black">
          Payment Details
        </Typography>
        <Stepper activeStep={activeStep} sx={{ marginBottom: '20px' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {isLoading ? <LoadingPage /> : getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ marginRight: '20px' }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading} // Vô hiệu hóa nút khi đang loading
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentDetailFixed;
