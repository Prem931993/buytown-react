import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatStrikethrough,
  Undo,
  Redo,
} from '@mui/icons-material';
import { adminService } from '../services/adminService';

const PageDetail = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing your content here...</p>',
    editorProps: {
      attributes: {
        dir: 'ltr',
        style: 'text-align: left; padding: 16px; min-height: 200px; outline: none;',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setPageData((prev) => ({ ...prev, content: html }));
    },
  });

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      adminService.pages.getById(id)
        .then((data) => {
          // Fix: Access data.page instead of data directly
          setPageData({
            title: data.page.title || '',
            slug: data.page.slug || '',
            content: data.page.content || '',
            status: data.page.status || 'draft',
          });
        })
        .catch((err) => {
          console.error('Failed to load page data:', err);
          setError('Failed to load page data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  // Separate useEffect for setting editor content
  useEffect(() => {
    if (editor && pageData.content && isEditMode) {
      editor.commands.setContent(pageData.content);
    }
  }, [editor, pageData.content, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPageData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditMode) {
        await adminService.pages.update(id, pageData);
        setSnackbar({ open: true, message: 'Page updated successfully', severity: 'success' });
      } else {
        await adminService.pages.create(pageData);
        setSnackbar({ open: true, message: 'Page created successfully', severity: 'success' });
      }
      setTimeout(() => {
        navigate('/pages');
      }, 1000);
    } catch (err) {
      setError('Failed to save page');
      setSnackbar({ open: true, message: 'Failed to save page', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Page' : 'Create New Page'}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              value={pageData.title}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Slug"
              name="slug"
              value={pageData.slug}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              helperText="URL-friendly identifier"
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                Content
              </Typography>

              {/* Toolbar */}
              <Paper sx={{ p: 1, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  color={editor.isActive('bold') ? 'primary' : 'default'}
                  title="Bold"
                >
                  <FormatBold />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  color={editor.isActive('italic') ? 'primary' : 'default'}
                  title="Italic"
                >
                  <FormatItalic />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  color={editor.isActive('strike') ? 'primary' : 'default'}
                  title="Strikethrough"
                >
                  <FormatStrikethrough />
                </IconButton>

                <Divider orientation="vertical" flexItem />

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  color={editor.isActive('bulletList') ? 'primary' : 'default'}
                  title="Bullet List"
                >
                  <FormatListBulleted />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  color={editor.isActive('orderedList') ? 'primary' : 'default'}
                  title="Numbered List"
                >
                  <FormatListNumbered />
                </IconButton>

                <Divider orientation="vertical" flexItem />

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="Undo"
                >
                  <Undo />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="Redo"
                >
                  <Redo />
                </IconButton>
              </Paper>

              {/* Editor */}
              <Box sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                minHeight: '300px',
                '& .ProseMirror': {
                  padding: '16px',
                  minHeight: '200px',
                  outline: 'none',
                  '&:focus': {
                    outline: 'none',
                  },
                  '& p': {
                    margin: '0 0 1em 0',
                    '&:last-child': {
                      marginBottom: '0',
                    },
                  },
                },
              }}>
                <EditorContent editor={editor} />
              </Box>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={pageData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => navigate('/pages')}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {isEditMode ? 'Update Page' : 'Create Page'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PageDetail;
