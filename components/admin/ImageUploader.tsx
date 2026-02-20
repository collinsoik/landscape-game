'use client';

import { useState, useRef } from 'react';
import { PixelButton } from '@/components/shared/PixelButton';

interface ImageUploaderProps {
  roomCode: string;
  adminToken: string;
  onUpload: (imagePath: string) => void;
}

export function ImageUploader({ roomCode, adminToken, onUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.onerror = () => setError('Failed to read file. Please try a different image.');
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('roomCode', roomCode);

      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      onUpload(data.imagePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-green-200">
        Satellite Image (optional)
      </label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full text-sm text-green-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-green-800 file:text-green-200 hover:file:bg-green-700 file:cursor-pointer"
      />
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Satellite preview"
            className="w-full max-h-48 object-contain border-2 border-green-700 rounded"
          />
          <PixelButton
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </PixelButton>
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
