import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

function PostManager() {
  const queryClient = useQueryClient();
  const [filterUserId, setFilterUserId] = useState('');

  // Fetching posts
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', filterUserId],
    queryFn: async () => {
      const url = new URL(API_URL);
      if (filterUserId) {
        url.searchParams.append('userId', filterUserId);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching posts');
      }
      return response.json();
    },
  });

  // Creating a post
  const createPostMutation = useMutation({
    mutationFn: async (newPost) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) {
        throw new Error('Error creating post');
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  // Updating a post
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updatedPost }) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });
      if (!response.ok) {
        throw new Error('Error updating post');
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  // Patching a post
  const patchPostMutation = useMutation({
    mutationFn: async ({ id, title }) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error('Error patching post');
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  // Deleting a post
  const deletePostMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting post');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  // Handlers for user actions
  const handleCreatePost = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPost = {
      title: formData.get('title'),
      body: formData.get('body'),
      userId: formData.get('userId'),
    };
    createPostMutation.mutate(newPost);
    e.target.reset();
  };

  const handleUpdatePost = (id, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedPost = {
      title: formData.get('title'),
      body: formData.get('body'),
      userId: formData.get('userId'),
    };
    updatePostMutation.mutate({ id, updatedPost });
  };

  const handlePatchPost = (id, title) => {
    patchPostMutation.mutate({ id, title });
  };

  const handleDeletePost = (id) => {
    deletePostMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts!</div>;

  return (
    <div>
      {/* Filter posts */}
      <input
        type="number"
        placeholder="Filter by user ID"
        value={filterUserId}
        onChange={(e) => setFilterUserId(e.target.value)}
      />

      {/* Create a new post */}
      <form onSubmit={handleCreatePost}>
        <input name="title" placeholder="title" required />
        <input name="body" placeholder="body" required />
        <input name="userId" placeholder="user id" type="number" required />
        <button type="submit">Submit</button>
      </form>

      {/* List of posts */}
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong> - {post.body}
            <button onClick={() => handlePatchPost(post.id, 'Updated Title')}>Patch</button>
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
            <form onSubmit={(e) => handleUpdatePost(post.id, e)}>
              <input name="title" placeholder="title" defaultValue={post.title} />
              <input name="body" placeholder="body" defaultValue={post.body} />
              <input name="userId" placeholder="user id" type="number" defaultValue={post.userId} />
              <button type="submit">Edit</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PostManager;
