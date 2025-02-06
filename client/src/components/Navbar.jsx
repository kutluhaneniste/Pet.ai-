import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", "SF Pro Display", sans-serif',
  fontWeight: 800,
  fontSize: '1.8rem',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  letterSpacing: '-0.03em',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    color: theme.palette.primary.main,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  padding: theme.spacing(1, 2),
  fontSize: '0.9rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  padding: theme.spacing(1, 3),
  fontSize: '0.9rem',
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const API_BASE_URL = 'http://localhost:5000';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const endpoint = tabValue === 0 ? '/api/auth/login' : '/api/auth/register';
      
      // Validasyonlar
      if (!formData.email || !formData.password) {
        setError('Email ve şifre zorunludur');
        return;
      }

      if (tabValue === 1) {
        if (!formData.firstName || !formData.lastName) {
          setError('Ad ve soyad zorunludur');
          return;
        }
        if (formData.password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır');
          return;
        }
        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
          setError('Geçersiz telefon numarası formatı');
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess(data.message || 'İşlem başarılı');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('API Hatası:', err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <StyledToolbar>
            {/* Logo ve Marka */}
            <LogoText variant="h6">
              <PetsIcon />
              pet.ai
            </LogoText>

            {/* Orta Menü */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <NavButton>Nasıl Çalışır?</NavButton>
              <NavButton>Örnekler</NavButton>
              <NavButton>Fiyatlandırma</NavButton>
              <NavButton>Blog</NavButton>
            </Box>

            {/* Sağ Menü */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="large" sx={{ color: 'text.primary' }}>
                <DarkModeIcon />
              </IconButton>
              <IconButton size="large" sx={{ color: 'text.primary' }}>
                <ShoppingCartIcon />
              </IconButton>
              <ActionButton
                variant="contained"
                startIcon={<AccountCircleIcon />}
                onClick={handleOpen}
              >
                Giriş Yap
              </ActionButton>
            </Box>
          </StyledToolbar>
        </Container>
      </AppBar>

      {/* Giriş/Üyelik Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Giriş Yap" />
            <Tab label="Üye Ol" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {/* Giriş Formu */}
          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
              />
            </Box>
          )}

          {/* Üyelik Formu */}
          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                placeholder="5321234567"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.email || !formData.password}
          >
            {tabValue === 0 ? 'Giriş Yap' : 'Üye Ol'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar; 
