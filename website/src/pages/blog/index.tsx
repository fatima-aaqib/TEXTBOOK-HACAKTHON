import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';

// Mock data for featured posts - in a real implementation, this would come from the blog plugin
const featuredPosts = [
  {
    id: 'advanced-ros2-mastering-nodes-topics',
    title: 'Advanced ROS 2: Mastering Nodes and Topics',
    author: 'Dr. AI Researcher',
    authorTitle: 'Senior Robotics Expert',
    authorImageUrl: 'https://github.com/author.png',
    date: '2025-01-15',
    description: 'Learn advanced ROS 2 concepts with practical examples',
    image: '/img/blog/ros2-advanced.jpg',
    tags: ['ros2', 'robotics', 'tutorial'],
    excerpt: 'Robot Operating System 2 (ROS 2) has revolutionized robotics development by providing a flexible framework for creating distributed robotic applications. Understanding nodes and topics is fundamental to building robust robotic systems.',
    permalink: '/blog/advanced-ros2-mastering-nodes-topics'
  },
  {
    id: 'building-simulation-environment-gazebo',
    title: 'Building Your First Simulation Environment with Gazebo',
    author: 'James Chen',
    authorTitle: 'Simulation Engineer',
    authorImageUrl: 'https://github.com/jameschen.png',
    date: '2025-01-10',
    description: 'Step-by-step guide to creating effective robot simulation environments',
    image: '/img/blog/gazebo-simulation.jpg',
    tags: ['gazebo', 'simulation', 'robotics', 'tutorial'],
    excerpt: 'Simulation is a critical component of robotics development, allowing you to test algorithms and validate designs before deploying to physical hardware. Gazebo provides a powerful platform for creating realistic robot simulations with accurate physics and sensor models.',
    permalink: '/blog/building-simulation-environment-gazebo'
  },
  {
    id: 'ethical-considerations-autonomous-robotics',
    title: 'Ethical Considerations in Autonomous Robotics',
    author: 'Prof. Lisa Park',
    authorTitle: 'Professor of AI Ethics',
    authorImageUrl: 'https://github.com/lisapark.png',
    date: '2025-01-05',
    description: 'Addressing the ethical implications of increasingly autonomous robotic systems',
    image: '/img/blog/robotics-ethics.jpg',
    tags: ['ethics', 'ai', 'robotics', 'autonomous', 'society'],
    excerpt: 'As autonomous robots become increasingly prevalent in our daily lives, from manufacturing floors to healthcare facilities, we must carefully consider the ethical implications of their deployment.',
    permalink: '/blog/ethical-considerations-autonomous-robotics'
  },
];

const BlogListPage = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Blog | ${siteConfig.title}`}
      description="Latest in Physical AI & Robotics - Educational content, tutorials, and insights">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest in Physical AI & Robotics</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Educational content, tutorials, and insights from experts in robotics, AI, and autonomous systems
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Featured Posts Grid */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <article 
                    key={post.id} 
                    className={clsx(
                      "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl",
                      index === 0 ? "md:col-span-2 md:flex" : ""
                    )}
                  >
                    <Link to={post.permalink} className="block h-full">
                      <div className={index === 0 ? "md:w-1/2" : ""}>
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className={index === 0 ? "md:w-1/2 p-6" : "p-6"}>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center">
                          <img 
                            src={post.authorImageUrl} 
                            alt={post.author} 
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.author}</p>
                            <p className="text-xs text-gray-500">{post.date}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {/* Recent Posts List */}
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
                <div className="flex flex-wrap gap-2">
                  {['All', 'ROS 2', 'Gazebo', 'NVIDIA Isaac', 'VLA', 'Tutorials', 'News'].map(category => (
                    <button
                      key={category}
                      className={`px-4 py-2 text-sm font-medium rounded-full ${
                        category === 'All' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
                {featuredPosts.map(post => (
                  <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <Link to={post.permalink} className="block">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/4">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                          <div className="md:w-3/4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.slice(0, 3).map(tag => (
                                <span 
                                  key={tag} 
                                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                            <p className="text-gray-600 mb-4">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img 
                                  src={post.authorImageUrl} 
                                  alt={post.author} 
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{post.author}</p>
                                  <p className="text-xs text-gray-500">{post.date}</p>
                                </div>
                              </div>
                              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                Read More →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <nav aria-label="Pagination" className="inline-flex items-center -space-x-px">
                  <button className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700">
                    Previous
                  </button>
                  <button className="px-3 py-2 leading-tight text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700">
                    1
                  </button>
                  <button className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                    2
                  </button>
                  <button className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                    3
                  </button>
                  <button className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700">
                    Next
                  </button>
                </nav>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8 space-y-8">
              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h3>
                <p className="text-gray-600 mb-4">
                  Stay updated with the latest in Physical AI & Robotics. Get tutorials, news, and insights delivered to your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Popular Tags */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['ros2', 'gazebo', 'nvidia', 'isaac', 'vla', 'tutorials', 'ai', 'robotics', 'simulation', 'ethics'].map(tag => (
                    <a
                      key={tag}
                      href="#"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1.5 rounded"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>

              {/* Authors */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Authors</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Dr. AI Researcher', title: 'Senior Robotics Expert', image: 'https://github.com/author.png' },
                    { name: 'James Chen', title: 'Simulation Engineer', image: 'https://github.com/jameschen.png' },
                    { name: 'Prof. Lisa Park', title: 'Professor of AI Ethics', image: 'https://github.com/lisapark.png' }
                  ].map(author => (
                    <div key={author.name} className="flex items-center">
                      <img 
                        src={author.image} 
                        alt={author.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{author.name}</p>
                        <p className="text-sm text-gray-500">{author.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default BlogListPage;