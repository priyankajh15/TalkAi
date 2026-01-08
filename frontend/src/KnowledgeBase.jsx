import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/knowledge');
      setArticles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await api.put(`/knowledge/${editingArticle._id}`, formData);
      } else {
        await api.post('/knowledge', formData);
      }
      
      setFormData({ title: '', content: '', category: '' });
      setShowForm(false);
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/knowledge/${id}`);
        fetchArticles();
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
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

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div className="glass" style={{
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Knowledge Base</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Manage your AI knowledge articles
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
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
                    >
                      Delete
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
  );
};

export default KnowledgeBase;