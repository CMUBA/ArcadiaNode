import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

function Discuss() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', tags: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3017/api/v1/discuss/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3017/api/v1/discuss/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPost,
          author: 'Anonymous',
          tags: newPost.tags.split(',').map(tag => tag.trim())
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setNewPost({ title: '', content: '', category: '', tags: '' });
      fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return h('div', { class: 'text-center p-4' }, 'Loading...');
  }

  return h('div', { class: 'max-w-4xl mx-auto p-4' }, [
    h('h1', { class: 'text-3xl font-bold mb-8' }, 'Discussion Forum'),

    // Post Form
    h('div', { class: 'bg-white rounded-lg shadow p-6 mb-8' }, [
      h('h2', { class: 'text-xl font-semibold mb-4' }, 'Create New Post'),
      h('form', { onSubmit: handleSubmit, class: 'space-y-4' }, [
        // Title Input
        h('div', {}, [
          h('label', { 
            for: 'title',
            class: 'block text-sm font-medium text-gray-700'
          }, 'Title'),
          h('input', {
            id: 'title',
            type: 'text',
            value: newPost.title,
            onInput: (e) => setNewPost({ ...newPost, title: e.target.value }),
            class: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            required: true
          })
        ]),

        // Content Input
        h('div', {}, [
          h('label', {
            for: 'content',
            class: 'block text-sm font-medium text-gray-700'
          }, 'Content'),
          h('textarea', {
            id: 'content',
            value: newPost.content,
            onInput: (e) => setNewPost({ ...newPost, content: e.target.value }),
            class: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            rows: '4',
            required: true
          })
        ]),

        // Category Input
        h('div', {}, [
          h('label', {
            for: 'category',
            class: 'block text-sm font-medium text-gray-700'
          }, 'Category'),
          h('input', {
            id: 'category',
            type: 'text',
            value: newPost.category,
            onInput: (e) => setNewPost({ ...newPost, category: e.target.value }),
            class: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          })
        ]),

        // Tags Input
        h('div', {}, [
          h('label', {
            for: 'tags',
            class: 'block text-sm font-medium text-gray-700'
          }, 'Tags'),
          h('input', {
            id: 'tags',
            type: 'text',
            value: newPost.tags,
            onInput: (e) => setNewPost({ ...newPost, tags: e.target.value }),
            class: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
            placeholder: 'Enter tags separated by commas'
          })
        ]),

        // Submit Button
        h('button', {
          type: 'submit',
          class: 'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }, 'Submit Post')
      ])
    ]),

    // Posts List
    h('div', { class: 'space-y-6' }, [
      error && h('div', { class: 'bg-red-50 border-l-4 border-red-400 p-4' },
        h('div', { class: 'text-red-700' }, error)
      ),
      ...posts.map((post) =>
        h('div', { key: post.cid, class: 'bg-white rounded-lg shadow p-6' }, [
          h('h3', { class: 'text-xl font-semibold mb-2' }, post.title),
          h('div', { class: 'text-sm text-gray-500 mb-4' }, [
            h('span', {}, new Date(post.timestamp).toLocaleString()),
            h('span', { class: 'mx-2' }, '•'),
            h('span', {}, post.author),
            post.category && [
              h('span', { class: 'mx-2' }, '•'),
              h('span', {}, post.category)
            ]
          ]),
          post.content && h('p', { class: 'mb-4' }, post.content),
          post.tags && post.tags.length > 0 &&
            h('div', { class: 'flex flex-wrap gap-2 mb-4' },
              post.tags.map((tag) =>
                h('span', {
                  key: tag,
                  class: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                }, tag)
              )
            )
        ])
      )
    ])
  ]);
}

export default Discuss; 