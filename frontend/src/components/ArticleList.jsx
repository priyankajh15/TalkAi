import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from './EmptyState';

const ArticleList = ({ articles, onEdit, onDelete, isDeleting, searchTerm, onShowForm }) => {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={faBook}
        title="No knowledge articles yet"
        description="Build your AI's knowledge base by adding articles, FAQs, and company information. This helps your AI agents provide accurate responses."
        actionText="Create Your First Article"
        onAction={onShowForm}
      />
    );
  }

  return (
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
                onClick={() => onEdit(article)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(article._id)}
                className="btn btn-secondary"
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
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
  );
};

export default ArticleList;