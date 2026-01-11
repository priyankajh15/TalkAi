import { useState } from 'react';
import { buttonPress } from '../utils/animations';
import { validateField, FormField } from '../utils/validation.jsx';

const ArticleForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      title: validateField('title', formData.title),
      content: validateField('content', formData.content)
    };
    
    setErrors(newErrors);
    setTouched({ title: true, content: true, category: true });
    
    // Check if there are any errors
    if (newErrors.title || newErrors.content) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>
        {initialData ? 'Edit Article' : 'Add New Article'}
      </h2>
      <form onSubmit={handleSubmit}>
        <FormField
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.title}
          touched={touched.title}
          placeholder="Article Title"
          required
        />
        
        <FormField
          name="category"
          value={formData.category}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Category (optional)"
        />
        
        <FormField
          name="content"
          value={formData.content}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.content}
          touched={touched.content}
          placeholder="Write the detailed content of your article..."
          rows={6}
          required
          style={{ resize: 'vertical' }}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={isLoading} {...buttonPress}>
            {isLoading ? 'Saving...' : (initialData ? 'Update Article' : 'Create Article')}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary" {...buttonPress}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;