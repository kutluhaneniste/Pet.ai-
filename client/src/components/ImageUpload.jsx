import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const uploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('YOUR_UPLOAD_URL', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Görsel yükleme hatası');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      throw new Error('Görsel yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!file) {
        setError('Lütfen bir görsel seçin');
        return;
      }

      if (!prompt.trim()) {
        setError('Lütfen bir prompt girin');
        return;
      }

      // Görseli yükle ve URL al
      const imageUrl = await uploadToServer(file);

      // Astria API'ye istek gönder
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl,
          prompt: prompt.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Görsel oluşturma hatası');
      }

      const data = await response.json();
      setSuccess('Görsel oluşturma başlatıldı');

      // Durumu kontrol et
      checkStatus(data.imageId);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/images/status/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Durum kontrolü hatası');
      }

      const data = await response.json();

      if (data.status === 'completed' && data.generatedUrl) {
        setGeneratedImage(data.generatedUrl);
        setSuccess('Görsel başarıyla oluşturuldu');
      } else if (data.status === 'failed') {
        setError('Görsel oluşturma başarısız oldu');
      } else {
        // 5 saniye sonra tekrar kontrol et
        setTimeout(() => checkStatus(imageId), 5000);
      }

    } catch (error) {
      setError('Durum kontrolü sırasında bir hata oluştu');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
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

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          {preview ? (
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain'
              }}
            />
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary" align="center">
                {isDragActive
                  ? 'Görseli buraya bırakın'
                  : 'Görsel yüklemek için tıklayın veya sürükleyin'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maksimum dosya boyutu: 5MB
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      <TextField
        fullWidth
        label="Prompt"
        multiline
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        sx={{ mb: 3 }}
      />

      <LoadingButton
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        loading={loading}
        disabled={!file || !prompt.trim()}
        startIcon={<ImageIcon />}
      >
        Görsel Oluştur
      </LoadingButton>

      {generatedImage && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Oluşturulan Görsel
          </Typography>
          <Box
            component="img"
            src={generatedImage}
            alt="Generated"
            sx={{
              width: '100%',
              borderRadius: 1,
              boxShadow: 3
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload; 