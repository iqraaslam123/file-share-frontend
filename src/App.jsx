import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const API_URL = "https://file-share-backend-w7sg.vercel.app";
  

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files`);
      setFiles(res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch files! Make sure backend is running on port 5000',
        background: '#fff',
        confirmButtonColor: '#6FCF97'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a file to upload!',
        background: '#fff',
        confirmButtonColor: '#6FCF97',
        timer: 2000,
        showConfirmButton: true
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await Swal.fire({
        icon: 'success',
        title: 'Uploaded!',
        text: `${file.name} has been uploaded successfully!`,
        background: '#fff',
        confirmButtonColor: '#6FCF97',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      setFile(null);
      setFileName('');
      await fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Something went wrong! Make sure backend is running',
        background: '#fff',
        confirmButtonColor: '#6FCF97'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${fileName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6FCF97',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff'
    });

    if (result.isConfirmed) {
      setDeletingId(fileId);
      try {
        // Make sure the URL is correct
        const deleteUrl = `${API_URL}/files/${fileId}`;
        console.log('Deleting from:', deleteUrl); // For debugging
        
        const response = await axios.delete(deleteUrl);
        
        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${fileName} has been deleted successfully.`,
            background: '#fff',
            confirmButtonColor: '#6FCF97',
            timer: 1500,
            showConfirmButton: false
          });
          
          // Refresh the file list after successful deletion
          await fetchFiles();
        }
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.response?.data?.message || 'Failed to delete file! Make sure backend is running',
          background: '#fff',
          confirmButtonColor: '#6FCF97'
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  useEffect(() => { 
    fetchFiles(); 
  }, []);

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝',
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
      'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬',
      'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
      'xls': '📊', 'xlsx': '📊', 'ppt': '📽️', 'pptx': '📽️'
    };
    return iconMap[ext] || '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="App">
      {/* Left Panel - File Share Section */}
      <div className="left-panel">
        <h1 className="main-title">✨ MERN File Share</h1>
        <p className="subtitle">Secure & Fast File Sharing Platform</p>
        
        <div className="upload-container">
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input 
                type="file" 
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile && selectedFile.size > 100 * 1024 * 1024) {
                    Swal.fire({
                      icon: 'error',
                      title: 'File Too Large',
                      text: 'Maximum file size is 100MB!',
                      background: '#fff',
                      confirmButtonColor: '#6FCF97'
                    });
                    return;
                  }
                  setFile(selectedFile);
                  setFileName(selectedFile?.name || '');
                }} 
              />
              <div className="upload-icon">📤</div>
              <div className="file-input-text">
                {fileName ? '✓ File Selected' : '📂 Click or Drag to Upload'}
              </div>
              {fileName && (
                <div className="file-name">
                  {fileName} ({file && formatFileSize(file.size)})
                </div>
              )}
            </label>
          </div>
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? '⏳ Uploading...' : '🚀 Upload File'}
          </button>
        </div>

        <div className="files-section">
          <div className="files-title">
            <span>📂</span> Uploaded Files ({files.length})
          </div>
          <div className="files-grid">
            {files.length === 0 ? (
              <div className="empty-state">
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>📭</div>
                <p>No files uploaded yet</p>
                <p style={{fontSize: '0.85rem', marginTop: '10px'}}>
                  Select a file and click upload to get started!
                </p>
              </div>
            ) : (
              files.map((f, index) => (
                <div key={f._id} className="file-card" style={{animationDelay: `${index * 0.05}s`}}>
                  <div className="file-info">
                    <div className="file-icon">{getFileIcon(f.name)}</div>
                    <div className="file-details">
                      <div className="file-name">{f.name}</div>
                      <div className="file-meta">
                        {formatFileSize(f.size)} • {new Date(f.uploadDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="button-group">
                    <a 
                      href={f.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="download-link"
                      onClick={() => {
                        Swal.fire({
                          icon: 'info',
                          title: 'Download Started!',
                          text: 'Your file download will begin shortly',
                          background: '#fff',
                          confirmButtonColor: '#6FCF97',
                          timer: 1500,
                          showConfirmButton: false
                        });
                      }}
                    >
                      ⬇️ Download
                    </a>
                    {/* <button
                      onClick={() => handleDelete(f._id, f.name)}
                      className="delete-btn"
                      disabled={deletingId === f._id}
                    >
                      {deletingId === f._id ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Instructions */}
      <div className="right-panel">
        <div className="instruction-title">
          <span>📖</span> How to Use
        </div>
        <div className="instruction-list">
          <div className="instruction-item">
            <div className="step-number">1</div>
            <div className="instruction-text">
              <strong>📁 Select File</strong>
              Click on the upload area to choose a file from your device (Max 100MB)
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="step-number">2</div>
            <div className="instruction-text">
              <strong>⬆️ Upload File</strong>
              Click the "Upload File" button to share your file securely to the cloud
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="step-number">3</div>
            <div className="instruction-text">
              <strong>📋 View Files</strong>
              All uploaded files appear instantly in the list on the left side
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="step-number">4</div>
            <div className="instruction-text">
              <strong>⬇️ Download / View</strong>
              Click the download button to access your files anytime, anywhere
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="step-number">🗑️</div>
            <div className="instruction-text">
              <strong>Delete Files</strong>
              Use the delete button to remove unwanted files from the server
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="step-number">💡</div>
            <div className="instruction-text">
              <strong>Pro Tip</strong>
              Files are stored securely with unique IDs and can be accessed via direct links
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '30px', 
          textAlign: 'center', 
          fontSize: '0.85rem',
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(111, 207, 151, 0.1), rgba(86, 180, 240, 0.1))',
          borderRadius: '12px',
          color: '#6FCF97'
        }}>
          🔒 Secure End-to-End Encryption <br/>
          ⚡ High-Speed Uploads & Downloads
        </div>
      </div>
    </div>
  );
}

export default App;