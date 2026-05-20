import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Button,
} from '@mui/material';

const categoryColors = {
  '洗涤准备': 'primary',
  '洗涤过程': 'info',
  '晾晒过程': 'success',
  '额外注意': 'warning',
};

export default function CareChecklist({ checklist }) {
  const [items, setItems] = useState(checklist);

  const handleToggle = (index) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const resetAll = () => {
    const newItems = items.map((item) => ({ ...item, checked: false }));
    setItems(newItems);
  };

  const completedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          ✅ 专属洗护注意清单
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={resetAll}
          sx={{ borderRadius: 2 }}
        >
          重置清单
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1, height: 10, bgcolor: 'grey.200', borderRadius: 5, overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              bgcolor: progress === 100 ? 'success.main' : 'primary.main',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 60, textAlign: 'right' }}>
          {completedCount}/{totalCount}
        </Typography>
      </Box>

      {progress === 100 && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'success.light',
            color: 'success.contrastText',
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            🎉 太棒了！所有注意事项都已完成
          </Typography>
        </Paper>
      )}

      <List>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <React.Fragment key={category}>
            <Box sx={{ px: 2, py: 1, mt: 1 }}>
              <Chip
                label={category}
                color={categoryColors[category]}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            {categoryItems.map((item, itemIndex) => {
              const globalIndex = items.findIndex((i) => i === item);
              return (
                <ListItem key={itemIndex} disablePadding>
                  <ListItemButton onClick={() => handleToggle(globalIndex)} dense>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={item.checked}
                        tabIndex={-1}
                        disableRipple
                        color={item.warning ? 'error' : 'primary'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked ? 'text.disabled' : item.warning ? 'error.main' : 'text.primary',
                        '& .MuiListItemText-primary': {
                          fontWeight: item.warning ? 600 : 400,
                        },
                      }}
                    />
                    {item.warning && !item.checked && (
                      <Typography variant="caption" color="error" sx={{ mr: 1 }}>
                        ⚠️ 重要
                      </Typography>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
