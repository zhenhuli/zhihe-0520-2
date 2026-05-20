import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DryIcon from '@mui/icons-material/Dry';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import BlockIcon from '@mui/icons-material/Block';

const colorMap = {
  primary: 'primary',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

export default function CareResult({ careResult }) {
  if (!careResult) return null;

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        📋 洗护方案分析结果
      </Typography>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Chip
          label={`${careResult.washMethod.icon} 推荐: ${careResult.washMethod.name}`}
          color={colorMap[careResult.washMethod.color]}
          sx={{
            fontSize: '1.5rem',
            py: 3,
            px: 4,
            fontWeight: 'bold',
            borderRadius: 3,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalLaundryServiceIcon color="primary" /> 洗涤建议
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ThermostatIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="适宜水温"
                  secondary={
                    careResult.maxTemp > 0
                      ? `不超过 ${careResult.maxTemp}°C`
                      : '不可水洗'
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="推荐洗涤剂"
                  secondary={careResult.detergent}
                />
              </ListItem>

              {careResult.forbiddenDetergent.length > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <BlockIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="禁用洗涤剂"
                    secondary={
                      <Typography variant="body2" color="error">
                        {careResult.forbiddenDetergent.join('、')}
                      </Typography>
                    }
                  />
                </ListItem>
              )}

              <ListItem>
                <ListItemIcon>
                  {careResult.canBleach ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <BlockIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="能否漂白"
                  secondary={careResult.canBleach ? '可以使用' : '禁止使用漂白剂'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DryIcon color="primary" /> 晾晒与保养
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DryIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="晾晒方式"
                  secondary={careResult.dryingMethod}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              温馨提示:
            </Typography>
            <List dense>
              {careResult.tips.slice(0, 5).map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Typography variant="body2">💡</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={tip}
                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {careResult.forbiddenDetergent.length > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }} icon={<WarningIcon />}>
          <strong>重要提醒:</strong> 请严格遵守禁用洗涤剂规定，避免损坏衣物。
        </Alert>
      )}
    </Paper>
  );
}
