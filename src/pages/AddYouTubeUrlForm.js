import React, { useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const AddYouTubeUrlForm = ({ onAdd }) => {
  const [url, setUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_self');

  const handleAdd = () => {
    if (!url) return;
    onAdd({
      fileName: url,
      filePath: url,
      mediaType: 'youtube',
      linkUrl: linkUrl || null,
      linkTarget: linkTarget || null,
    });
    setUrl('');
    setLinkUrl('');
    setLinkTarget('_self');
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
      />
      <TextField
        label="Link URL (optional)"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
      />
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id="link-target-label">Link Target</InputLabel>
        <Select
          labelId="link-target-label"
          value={linkTarget}
          label="Link Target"
          onChange={(e) => setLinkTarget(e.target.value)}
        >
          <MenuItem value="_self">Same Window</MenuItem>
          <MenuItem value="_blank">New Window</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleAdd} disabled={!url}>
        Add YouTube URL
      </Button>
    </Box>
  );
};

export default AddYouTubeUrlForm;
