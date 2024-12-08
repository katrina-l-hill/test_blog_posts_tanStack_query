import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PostManager from './PostManager';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const server = setupServer(
  rest.get(API_URL, (req, res, ctx) => {
    return res(ctx.json([{ id: 1, title: 'Post 1', body: 'Body 1', userId: 1 }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches and displays posts with no filter', async () => {
  render(<PostManager />);
  expect(await screen.findByText('Post 1')).toBeInTheDocument();
});

test('creates a new post', async () => {
  render(<PostManager />);
  fireEvent.change(screen.getByPlaceholderText('title'), { target: { value: 'New Post' } });
  fireEvent.change(screen.getByPlaceholderText('body'), { target: { value: 'New Body' } });
  fireEvent.change(screen.getByPlaceholderText('user id'), { target: { value: '1' } });
  fireEvent.click(screen.getByText('Submit'));

  expect(await screen.findByText('New Post')).toBeInTheDocument();
});

test('updates an existing post', async () => {
  render(<PostManager />);
  fireEvent.change(screen.getByPlaceholderText('title'), { target: { value: 'Updated Post' } });
  fireEvent.change(screen.getByPlaceholderText('body'), { target: { value: 'Updated Body' } });
  fireEvent.change(screen.getByPlaceholderText('user id'), { target: { value: '1' } });
  fireEvent.click(screen.getByText('Edit'));

  expect(await screen.findByText('Updated Post')).toBeInTheDocument();
});

test('fetches posts with invalid user ID', async () => {
  render(<PostManager />);
  fireEvent.change(screen.getByPlaceholderText('Filter by user ID'), { target: { value: '-1' } });

  await waitFor(() => expect(screen.queryByText('Post 1')).not.toBeInTheDocument());
});

test('does not create a post with missing fields', async () => {
  render(<PostManager />);
  fireEvent.change(screen.getByPlaceholderText('title'), { target: { value: '' } });
  fireEvent.change(screen.getByPlaceholderText('body'), { target: { value: 'New Body' } });
  fireEvent.change(screen.getByPlaceholderText('user id'), { target: { value: '1' } });
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => expect(screen.queryByText('New Body')).not.toBeInTheDocument());
});

test('handles deletion of a non-existent post', async () => {
  render(<PostManager />);
  fireEvent.click(screen.getByText('Delete'));

  expect(await screen.findByText('Error deleting post')).toBeInTheDocument();
});