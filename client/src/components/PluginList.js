import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Link } from 'preact-router/match';

function PluginList() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await fetch('http://localhost:3017');
        if (!response.ok) {
          throw new Error('Failed to fetch plugins');
        }
        const data = await response.json();
        setPlugins(data.plugins || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  if (loading) {
    return h('div', { class: 'text-center p-4' }, 'Loading...');
  }

  if (error) {
    return h('div', { class: 'text-red-500 p-4' }, `Error: ${error}`);
  }

  return h('div', { class: 'bg-white rounded-lg shadow p-6' }, [
    h('h2', { class: 'text-2xl font-bold mb-4' }, 'Available Plugins'),
    h('div', { class: 'space-y-4' },
      plugins.map((plugin) => 
        h('div', { key: plugin.name, class: 'border rounded-lg p-4' },
          h('div', { class: 'flex items-center justify-between' }, [
            h('div', {}, [
              h('h3', { class: 'text-xl font-semibold' },
                plugin.name === 'discuss'
                  ? h(Link, {
                      href: '/discuss',
                      class: 'text-blue-600 hover:text-blue-800'
                    }, plugin.name)
                  : plugin.name
              ),
              h('div', { class: 'mt-2' },
                h('span', {
                  class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plugin.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`
                }, plugin.status)
              )
            ]),
            plugin.details && h('div', { class: 'text-sm text-gray-500' },
              Object.entries(plugin.details)
                .filter(([key]) => key !== 'status')
                .map(([key, value]) =>
                  h('div', { key, class: 'flex items-center space-x-2' }, [
                    h('span', { class: 'font-medium' }, `${key}:`),
                    h('span', {}, typeof value === 'object' ? JSON.stringify(value) : value)
                  ])
                )
            )
          ])
        )
      )
    )
  ]);
}

export default PluginList; 