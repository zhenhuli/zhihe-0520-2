import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { fabricTypes, colorDepths, decorations } from '../data/careKnowledge';

export default function ClothesForm({
  selectedFabric,
  setSelectedFabric,
  selectedColor,
  setSelectedColor,
  selectedDecorations,
  setSelectedDecorations,
  onSubmit,
}) {

  const handleDecorationToggle = (decorId) => {
    setSelectedDecorations((prev) => {
      if (prev.includes(decorId)) {
        return prev.filter((id) => id !== decorId);
      } else {
        return [...prev, decorId];
      }
    });
  };
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        👔 输入衣物信息
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          🧵 面料成分
        </Typography>
        <Grid container spacing={1.5}>
          {fabricTypes.map((fabric) => (
            <Grid item key={fabric.id}>
              <Chip
                label={`${fabric.icon} ${fabric.name}`}
                onClick={() => setSelectedFabric(fabric.id)}
                color={selectedFabric === fabric.id ? 'primary' : 'default'}
                variant={selectedFabric === fabric.id ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.95rem',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          🎨 颜色深浅
        </Typography>
        <Grid container spacing={1.5}>
          {colorDepths.map((color) => (
            <Grid item key={color.id}>
              <Chip
                label={color.name}
                onClick={() => setSelectedColor(color.id)}
                color={selectedColor === color.id ? 'secondary' : 'default'}
                variant={selectedColor === color.id ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.95rem',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
        {selectedColor && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {colorDepths.find((c) => c.id === selectedColor)?.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          ✨ 装饰工艺 <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'text.secondary' }}>(可多选)</span>
        </Typography>
        <Grid container spacing={1.5}>
          {decorations.map((decor) => (
            <Grid item key={decor.id}>
              <Chip
                label={`${decor.icon} ${decor.name}`}
                onClick={() => handleDecorationToggle(decor.id)}
                color={selectedDecorations.includes(decor.id) ? 'success' : 'default'}
                variant={selectedDecorations.includes(decor.id) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.95rem',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onSubmit}
          disabled={!selectedFabric || !selectedColor || selectedDecorations.length === 0}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 2,
            fontWeight: 'bold',
          }}
        >
          🔍 智能判别洗护方案
        </Button>
      </Box>
    </Paper>
  );
}
