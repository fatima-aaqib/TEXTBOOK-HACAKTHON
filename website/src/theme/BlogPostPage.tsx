import React from 'react';
import Layout from '@theme/Layout';
import BlogPostPage from '@theme/BlogPostPage';
import TOC from '@theme/TOC';
import clsx from 'clsx';

// Custom Blog Post Component that extends the default
const CustomBlogPost = (props) => {
  const { content: BlogPostContents } = props;
  const { 
    frontMatter, 
    assets, 
    metadata 
  } = BlogPostContents;
  
  const {
    title,
    description,
    date,
    authors,
    tags,
    image,
    toc
  } = metadata;

  return (
    <Layout
      title={title}
      description={description}
      wrapperClassName="bg-gray-50"
    >
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Article Header */}
          <header className="border-b border-gray-200 p-8">
            <div className="mb-4">
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <span 
                      key={tag.label} 
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex items-center">
                {authors?.length > 0 && authors[0]?.image && (
                  <img 
                    src={authors[0].image} 
                    alt={authors[0].name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{authors?.[0]?.name || 'Author'}</p>
                  <p className="text-sm text-gray-500">{date} • {metadata.readingTime} min read</p>
                </div>
              </div>
            </div>
            
            {image && (
              <div className="mt-6">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </header>

          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="lg:w-3/4 p-8">
              {/* Table of Contents */}
              {toc && toc.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <ul className="space-y-2">
                    {toc.map((item, idx) => (
                      <li key={idx} className="ml-4">
                        <a 
                          href={item.url} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {item.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Blog Content */}
              <div className="prose prose-lg max-w-none">
                <BlogPostContents />
              </div>

              {/* Key Takeaways */}
              <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Takeaways</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Understanding fundamental concepts is crucial for advanced implementations</li>
                  <li>Best practices ensure robust and maintainable systems</li>
                  <li>Continuous learning keeps you updated with evolving technologies</li>
                </ul>
              </div>

              {/* Related Resources */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="#" 
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <h4 className="font-semibold text-blue-600">Documentation</h4>
                    <p className="text-gray-600 text-sm mt-1">Official documentation and guides</p>
                  </a>
                  <a 
                    href="#" 
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <h4 className="font-semibold text-blue-600">Tutorials</h4>
                    <p className="text-gray-600 text-sm mt-1">Step-by-step learning resources</p>
                  </a>
                </div>
              </div>

              {/* Author Bio */}
              {authors?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
                  <div className="flex items-start">
                    {authors[0]?.image && (
                      <img 
                        src={authors[0].image} 
                        alt={authors[0].name} 
                        className="w-16 h-16 rounded-full mr-4"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{authors[0].name}</h4>
                      <p className="text-gray-600">{authors[0].title || 'Author'}</p>
                      <p className="mt-2 text-gray-700">
                        {authors[0].description || 'This author has written several articles on robotics and AI.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section Placeholder */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Discussion</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">Join the discussion about this article.</p>
                  <textarea 
                    placeholder="Share your thoughts..." 
                    className="w-full p-4 border border-gray-300 rounded-lg mb-4"
                    rows="4"
                  ></textarea>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar with TOC */}
            <div className="lg:w-1/4 p-8 border-l border-gray-200">
              {toc && toc.length > 0 && (
                <div className="sticky top-8">
                  <TOC toc={toc} />
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default CustomBlogPost;