import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import PostManager from './PostManager';

const queryClient = new QueryClient();

test('renders learn react link', () => {
  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

global.fetch = jest.fn();

describe('App component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders posts from API', async () => {
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ]),
    });
  
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  
    const post1 = await screen.findByText('Post 1');
    const post2 = await screen.findByText('Post 2');
  
    expect(post1).toBeInTheDocument();
    expect(post2).toBeInTheDocument();
  });
});

test('displays loading state while fetching data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([ { id: 1, title: 'Post 1', body: 'Body 1', userId: 1 } ]) 
    })
  );

  render(
    <QueryClientProvider client={queryClient}>
      <PostManager />
    </QueryClientProvider>
  );

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  const post1 = await screen.findByText('Post 1');
  expect(post1).toBeInTheDocument();
});

test('handles fetch error gracefully', async () => {
  fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.queryByText('Post 2')).not.toBeInTheDocument();
  });

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

test('handles empty response gracefully', async () => {
  fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([]),
  });

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.queryByText('Post 2')).not.toBeInTheDocument();
  });

  expect(screen.getByText(/no posts available/i)).toBeInTheDocument();
});

test('handles unexpected data gracefully', async () => {
  fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([{ id: 1 }]),
  });

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
  });

  expect(screen.getByText(/unexpected data format/i)).toBeInTheDocument();
});

test('makes multiple fetch requests when needed', async () => {
  fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([{ id: 1, title: 'Post 1' }]),
  }).mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([{ id: 2, title: 'Post 2' }]),
  });

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Post 1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });

  expect(fetch).toHaveBeenCalledTimes(2);
});

test('shows "no posts available" when no data is returned', async () => {
  fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([]),
  });

  render(
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <App />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/no posts available/i)).toBeInTheDocument();
  });
});