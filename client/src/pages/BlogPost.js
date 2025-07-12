import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('BlogPost component - id from params:', id);
  console.log('BlogPost component - window.location:', window.location.href);

  const fetchPost = useCallback(async () => {
    try {
      console.log('Fetching post with ID:', id);
      const response = await axios.get(`/api/blog/posts/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('API Response:', response.data);
      console.log('API Response structure:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataType: typeof response.data?.data,
        hasPost: !!response.data?.data?.post,
        postType: typeof response.data?.data?.post
      });
      
      // API trả về { success: true, data: { post } }
      let postData = null;
      
      if (response.data?.data?.post) {
        postData = response.data.data.post;
        console.log('Using response.data.data.post');
      } else if (response.data?.data) {
        postData = response.data.data;
        console.log('Using response.data.data');
      } else if (response.data) {
        postData = response.data;
        console.log('Using response.data');
      }
      
      console.log('Final post data:', postData);
      
      if (!postData) {
        throw new Error('Không có dữ liệu bài viết');
      }
      
      setPost(postData);
      setError(null);
    } catch (error) {
      console.error('Error fetching post:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải bài viết';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('BlogPost useEffect - calling fetchPost with id:', id);
    fetchPost();
  }, [fetchPost, id]);

  console.log('BlogPost render - loading:', loading, 'error:', error, 'post:', post);

  const testApiCall = async () => {
    try {
      console.log('Testing API call to:', `/api/blog/posts/${id}`);
      const response = await axios.get(`/api/blog/posts/${id}`);
      console.log('Test API Response:', response.data);
      toast.success('API call successful!');
    } catch (error) {
      console.error('Test API Error:', error);
      toast.error('API call failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
          <button 
            onClick={testApiCall}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Không tìm thấy bài viết'}
          </h2>
          <button 
            onClick={testApiCall}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
          <br />
          <Link to="/blog" className="text-primary-600 hover:text-primary-700">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-500 mb-6">
            <span>Đăng bởi {post.author_name || post.author?.username || 'Ẩn danh'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default BlogPost; 