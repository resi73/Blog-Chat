import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, FileText, Users, Shield } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary-600" />,
      title: 'Blog System',
      description: 'Tạo và chia sẻ bài viết với cộng đồng. Hỗ trợ hình ảnh và bình luận.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
      title: 'Real-time Chat',
      description: 'Trò chuyện real-time với WebSocket. Tạo phòng chat và giao lưu với mọi người.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'User Management',
      description: 'Hệ thống đăng ký, đăng nhập an toàn với JWT và bcrypt.'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure API',
      description: 'API được bảo vệ với authentication, rate limiting và validation.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Blog & Chat App
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Nền tảng blog hiện đại với tính năng chat real-time. 
          Chia sẻ ý tưởng và kết nối với cộng đồng một cách dễ dàng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/blog"
                className="btn btn-secondary text-lg px-8 py-3"
              >
                Xem Blog
              </Link>
            </>
          ) : (
            <Link
              to="/blog"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Khám phá Blog
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-16 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Công nghệ sử dụng
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Express.js</li>
                <li>• PostgreSQL</li>
                <li>• JWT Authentication</li>
                <li>• Socket.io</li>
                <li>• bcrypt</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• React.js</li>
                <li>• React Router</li>
                <li>• Tailwind CSS</li>
                <li>• Axios</li>
                <li>• Socket.io Client</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">DevOps</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Docker</li>
                <li>• Docker Compose</li>
                <li>• Environment Variables</li>
                <li>• Health Checks</li>
                <li>• CORS Configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Sẵn sàng tham gia?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Tạo tài khoản ngay hôm nay và bắt đầu chia sẻ ý tưởng của bạn!
        </p>
        {!isAuthenticated ? (
          <Link
            to="/register"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Đăng ký miễn phí
          </Link>
        ) : (
          <Link
            to="/chat"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Tham gia Chat
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home; 