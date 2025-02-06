import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, Button, 
         CircularProgress, useTheme, useMediaQuery, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDropzone } from 'react-dropzone';

// Özel stil tanımlamaları
const StepBox = styled(Paper)(({ theme, completed, isOutput, isCompact }) => ({
  padding: isCompact ? theme.spacing(2) : theme.spacing(3),
  marginBottom: theme.spacing(2),
  position: 'relative',
  borderLeft: isOutput ? 'none' : `3px solid ${completed === 'true' ? theme.palette.success.main : theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  backgroundColor: completed === 'true' ? 'rgba(0, 0, 0, 0.02)' : theme.palette.background.paper,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  '& .MuiSvgIcon-root.step-icon': {
    position: 'absolute',
    right: theme.spacing(2),
    top: '50%',
    transform: 'translateY(-50%)',
    color: completed === 'true' ? theme.palette.success.main : theme.palette.divider,
    fontSize: '1.5rem',
    display: isOutput ? 'none' : 'block'
  }
}));

const DropzoneArea = styled(Paper)(({ theme, isDragActive }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: theme.palette.primary.main,
  },
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
});

const GeneratedImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const FramedImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: '24px',
  backgroundColor: '#ffffff',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
  }
}));

const DeliveryFormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
  }
}));

const steps = [
  { label: 'Fotoğraf Yükleme', completed: false, isCompact: true },
  { label: 'Prompt Girişi', completed: false, isCompact: true },
  { label: 'Görsel Oluşturma', completed: false, isCompact: true },
  { label: 'Çıktı Seçenekleri', completed: false, isOutput: true },
  { label: 'Teslimat Bilgileri', completed: false },
  { label: 'Ödeme', completed: false },
];

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [completedSteps, setCompletedSteps] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploadedFile({
        file,
        preview: URL.createObjectURL(file)
      });
      handleComplete(0);
    }
  });

  const handleComplete = (step) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    setActiveStep(step + 1);
    if (step === 2) {
      setGeneratedImage('https://picsum.photos/800/600');
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Görseli S3'e yükle (şimdilik direkt URL kullanıyoruz)
      const imageUrl = uploadedFile.preview;

      // Astria API'ye istek gönder
      const response = await fetch('http://localhost:5001/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          imageUrl,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error('Görsel oluşturma hatası');
      }

      const data = await response.json();
      
      // Durum kontrolü için interval başlat
      const checkInterval = setInterval(async () => {
        const statusResponse = await fetch(`http://localhost:5001/api/images/status/${data.jobId}?imageId=${data.imageId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed' && statusData.images && statusData.images.length > 0) {
          clearInterval(checkInterval);
          setGeneratedImage(statusData.images[0]);
          handleComplete(2);
          setIsGenerating(false);
        } else if (statusData.status === 'failed') {
          clearInterval(checkInterval);
          setIsGenerating(false);
          // Hata durumunu göster
          alert('Görsel oluşturma başarısız oldu: ' + statusData.error);
        }
      }, 5000); // Her 5 saniyede bir kontrol et

    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      setIsGenerating(false);
      alert('Görsel oluşturulurken bir hata oluştu');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CloudUploadIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Fotoğraf Yükle
              </Typography>
            </Box>
            {!uploadedFile && (
              <Typography variant="caption" color="text.secondary">
                Sürükle & Bırak veya Tıkla
              </Typography>
            )}
            {uploadedFile && (
              <PreviewImage 
                src={uploadedFile.preview} 
                alt="Yüklenen fotoğraf"
                sx={{ maxHeight: 150 }}
              />
            )}
          </DropzoneArea>
        );
      case 1:
        return (
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (e.target.value.length > 10) handleComplete(1);
            }}
            placeholder="Evcil hayvanınız için bir prompt girin..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          />
        );
      case 2:
        return (
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={handleGenerate}
            disabled={isGenerating}
            sx={{
              py: 1,
              fontSize: '0.9rem',
            }}
          >
            {isGenerating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Generate'
            )}
          </Button>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handleComplete(3)}
              >
                PDF olarak kaydet
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShoppingCartIcon />}
                onClick={() => handleComplete(3)}
              >
                Canvas Sipariş Et
              </Button>
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={() => setActiveStep(4)}
            sx={{ py: 1 }}
          >
            Teslimat Bilgilerini Gir
          </Button>
        );
      case 5:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Toplam: 299 TL
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleComplete(5)}
            >
              Ödemeyi Tamamla
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDeliveryForm = () => (
    <DeliveryFormContainer>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Teslimat Bilgileri
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ad"
            value={deliveryInfo.name}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, name: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Soyad"
            value={deliveryInfo.surname}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, surname: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            value={deliveryInfo.email}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, email: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Telefon"
            value={deliveryInfo.phone}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adres"
            multiline
            rows={3}
            value={deliveryInfo.address}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Şehir"
            value={deliveryInfo.city}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, city: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Posta Kodu"
            value={deliveryInfo.zipCode}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, zipCode: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Sipariş Notu"
            multiline
            rows={2}
            value={deliveryInfo.notes}
            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Varsa özel notlarınızı buraya yazabilirsiniz..."
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => handleComplete(4)}
            sx={{ mt: 2 }}
          >
            Bilgileri Kaydet ve Devam Et
          </Button>
        </Grid>
      </Grid>
    </DeliveryFormContainer>
  );

  const renderGeneratedContent = () => (
    <Grid container spacing={4} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
        <GeneratedImageContainer>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Oluşturulan Görsel
          </Typography>
          <Box sx={{ my: 4, width: '100%' }}>
            <PreviewImage src={generatedImage} alt="Generated" />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleComplete(3)}
            sx={{ mt: 2 }}
          >
            PDF olarak kaydet
          </Button>
        </GeneratedImageContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <GeneratedImageContainer>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Çerçeveli Önizleme
          </Typography>
          <FramedImage sx={{ mt: 4, width: '100%', maxWidth: 400 }}>
            <img 
              src={generatedImage} 
              alt="Framed Preview" 
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block',
              }} 
            />
          </FramedImage>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => {
              setActiveStep(4);
              setCompletedSteps(prev => ({ ...prev, 3: true }));
            }}
            sx={{ mt: 4 }}
          >
            Canvas Olarak Sipariş Et
          </Button>
        </GeneratedImageContainer>
      </Grid>
    </Grid>
  );

  const renderRightContent = () => {
    if (activeStep === 4) {
      return renderDeliveryForm();
    }
    
    return (
      <Fade in={!!generatedImage}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper', minHeight: 600 }}>
          {generatedImage ? renderGeneratedContent() : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h5" color="textSecondary">
                Henüz bir görsel oluşturulmadı
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Soldaki adımları takip ederek evcil hayvanınızın sanatsal portresini oluşturun
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>
    );
  };

  return (
    <Box sx={{ pt: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              {steps.map((step, index) => (
                <StepBox
                  key={index}
                  completed={completedSteps[index] ? 'true' : 'false'}
                  isOutput={step.isOutput}
                  isCompact={step.isCompact}
                >
                  <Typography 
                    variant={step.isCompact ? "body2" : "subtitle1"} 
                    gutterBottom 
                    sx={{ 
                      fontWeight: step.isCompact ? 500 : 600,
                      mb: step.isCompact ? 1 : 2
                    }}
                  >
                    {step.label}
                  </Typography>
                  {renderStepContent(index)}
                  <CheckCircleIcon 
                    className="step-icon"
                    sx={{ 
                      opacity: completedSteps[index] ? 1 : 0.3,
                      fontSize: step.isCompact ? '1.2rem' : '1.5rem'
                    }}
                  />
                </StepBox>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {renderRightContent()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 