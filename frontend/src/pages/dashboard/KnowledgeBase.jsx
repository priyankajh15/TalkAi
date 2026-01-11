import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { SkeletonCard } from '../../components/Skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { buttonPress } from '../../utils/animations';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import ArticleForm from '../../components/ArticleForm';
import ArticleList from '../../components/ArticleList';

const KnowledgeBase = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ USEQUERY: Fetch articles with debounced search
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['knowledge', debouncedSearch],
    queryFn: async () => {
      const response = await api.get('/knowledge');
      const allArticles = response.data.data || [];
      
      // Client-side filtering with debounced search
      if (!debouncedSearch) return allArticles;
      
      return allArticles.filter(article => 
        article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        article.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (article.category && article.category.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }
  });

  // ✅ USEMUTATION: Create article
  const createMutation = useMutation({
    mutationFn: (newArticle) => api.post('/knowledge', newArticle),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); 
      toast.success('Article created successfully!');
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create article');
    }
  });

  // ✅ USEMUTATION: Update article
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/knowledge/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); 
      toast.success('Article updated successfully!');
      setShowForm(false);
      setEditingArticle(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update article');
    }
  });

  // ✅ USEMUTATION: Delete article
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/knowledge/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge']); 
      toast.success('Article deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete article');
    }
  });

  const handleSubmit = (formData) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  // ✅ AUTOMATIC LOADING STATE
  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '30px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Knowledge Base</h1>
            <p style={{ color: '#999', fontSize: '16px' }}>Manage your AI knowledge articles</p>
          </div>
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </DashboardLayout>
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
          
          {/* Search and Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '20px',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <FontAwesomeIcon 
                icon={faSearch} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#999',
                  fontSize: '14px'
                }} 
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
              {...buttonPress}
            >
              {showForm ? 'Cancel' : 'Add Article'}
            </button>
          </div>
        </div>

      {/* Add/Edit Form */}
      {showForm && (
        <ArticleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingArticle}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Articles List */}
      <div className="glass" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>
          Articles ({articles.length}){searchTerm && ` - "${searchTerm}"`}
        </h2>
        
        <ArticleList
          articles={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
          searchTerm={searchTerm}
          onShowForm={() => setShowForm(true)}
        />
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone and will permanently remove the article from your knowledge base."
        confirmText="Delete Article"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;