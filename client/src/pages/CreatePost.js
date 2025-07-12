import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle file input change for image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    // Clear image_url if file is selected
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_url: ''
      }));
    }
  };

  // Handle image_url input change
  const handleImageUrlChange = (e) => {
    setFormData({
      ...formData,
      image_url: e.target.value
    });
    // Clear file if url is entered
    if (e.target.value) {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let postData = { ...formData };

    try {
      // If image file is selected, validate file size and type
      if (imageFile) {
        // Check file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
          setLoading(false);
          return;
        }
        
        // Check file type
        if (!imageFile.type.startsWith('image/')) {
          toast.error('Vui lòng chọn file ảnh hợp lệ.');
          setLoading(false);
          return;
        }

        // For now, we'll skip the image file and just use URL
        // In a real app, you'd upload to a server first
        toast.error('Tính năng upload file đang được phát triển. Vui lòng sử dụng URL ảnh.');
        setLoading(false);
        return;
      }

      // Validate image_url if provided
      if (postData.image_url && postData.image_url.length > 500) {
        toast.error('URL ảnh quá dài. Vui lòng sử dụng URL ngắn hơn.');
        setLoading(false);
        return;
      }

      await axios.post('/api/blog/posts', postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Tạo bài viết thành công!');
      navigate('/blog');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Tạo bài viết thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Viết bài mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nhập tiêu đề bài viết"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nhập nội dung bài viết"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện (tùy chọn)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
            <div className="text-xs text-gray-500 mb-2">Hoặc nhập URL hình ảnh:</div>
            <input
              type="url"
              id="image_url"
              name="image_url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={handleImageUrlChange}
              disabled={!!imageFile}
            />
            {imageFile && (
              <div className="text-xs text-green-600 mt-1">
                Đã chọn file: {imageFile.name}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;