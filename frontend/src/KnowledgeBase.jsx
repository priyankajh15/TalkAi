import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from './DashboardLayout';
import api from './api';

const KnowledgeBase = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const queryClient = useQueryClient();

  // ✅ USEQUERY: Fetch articles with automatic caching
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['knowledge'],
    queryFn: async () => {
      const response = await api.get('/knowledge');
      return response.data.data || [];
    }
  });

  // ✅ USEMUTATION: Create article
  const createMutation = useMutation({
    mutationFn: (newArticle) => api.post('/knowledge', newArticle),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); // Auto-refresh list
      setFormData({ title: '', content: '', category: '' });
      setShowForm(false);
    }
  });

  // ✅ USEMUTATION: Update article
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/knowledge/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); // Auto-refresh list
      setFormData({ title: '', content: '', category: '' });
      setShowForm(false);
      setEditingArticle(null);
    }
  });

  // ✅ USEMUTATION: Delete article
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/knowledge/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); // Auto-refresh list
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ AUTOMATIC LOADING STATE
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="glass" style={{ padding: '40px' }}>
          Loading knowledge base...
        </div>
      </div>
    );
  }

  // ✅ AUTOMATIC ERROR STATE
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Error loading knowledge base</h2>
          <p style={{ color: '#999' }}>{error.message}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(['knowledge'])}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Knowledge Base</h1>
          <p style={{ color: '#999', fontSize: '16px' }}>Manage your AI knowledge articles</p>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : 'Add Article'}
            </button>
          </div>
        </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {editingArticle ? 'Edit Article' : 'Add New Article'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                name="title"
                placeholder="Article Title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                name="category"
                placeholder="Category (optional)"
                value={formData.category}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <textarea
                name="content"
                placeholder="Article Content"
                value={formData.content}
                onChange={handleChange}
                className="input"
                rows="6"
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingArticle(null);
                  setFormData({ title: '', content: '', category: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="glass" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>
          Articles ({articles.length})
        </h2>
        
        {articles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'rgba(255,255,255,0.7)' 
          }}>
            <p>No knowledge articles yet.</p>
            <p>Click "Add Article" to create your first one.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {articles.map((article) => (
              <div 
                key={article._id} 
                className="glass"
                style={{ padding: '20px' }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '8px' }}>{article.title}</h3>
                    {article.category && (
                      <span style={{
                        background: 'rgba(102, 126, 234, 0.2)',
                        color: '#667eea',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {article.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(article)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(article._id)}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#ef4444'
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '1.5',
                  marginTop: '10px'
                }}>
                  {article.content.length > 200 
                    ? `${article.content.substring(0, 200)}...` 
                    : article.content
                  }
                </p>
                <div style={{ 
                  marginTop: '10px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  Created: {new Date(article.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;