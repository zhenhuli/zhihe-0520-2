import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  Container,
  CssBaseline,
  Box,
  Typography,
} from '@mui/material';
import ClothesForm from './components/ClothesForm';
import CareResult from './components/CareResult';
import CareChecklist from './components/CareChecklist';
import { determineCareMethod, generateChecklist } from './utils/careLogic';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
});

function App() {
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const [careResult, setCareResult] = useState(null);
  const [checklist, setChecklist] = useState(null);

  const handleSubmit = () => {
    if (selectedFabric && selectedColor && selectedDecorations.length > 0) {
      const result = determineCareMethod(selectedFabric, selectedColor, selectedDecorations);
      result.fabricId = selectedFabric;
      setCareResult(result);
      const newChecklist = generateChecklist(result);
      setChecklist(newChecklist);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              🧺 衣物洗护智能判别工具
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              输入衣物面料成分、颜色深浅、装饰工艺，智能匹配最佳洗护方案
            </Typography>
          </Box>

          <ClothesForm
            selectedFabric={selectedFabric}
            setSelectedFabric={setSelectedFabric}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedDecorations={selectedDecorations}
            setSelectedDecorations={setSelectedDecorations}
            onSubmit={handleSubmit}
          />

          {careResult && (
            <Box sx={{ mb: 4 }}>
              <CareResult careResult={careResult} />
            </Box>
          )}

          {checklist && (
            <CareChecklist checklist={checklist} />
          )}

          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Typography variant="body2">
              💡 温馨提示：本工具仅供参考，特殊面料请以衣物洗涤标签为准
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
