'use client';

import React, { useState } from 'react';
import { storage, db, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // We'll use UUID for unique job IDs

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // More robust validation
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please upload a valid audio file (MP3, WAV, etc.).');
        setFile(null);
        return;
      }
      // Optional: File size limit (e.g., 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File is too large. Please upload a file smaller than 25MB.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) {
      setError('No file selected or you are not logged in.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');
    setProgress(0);

    // Create a unique path in Firebase Storage.
    const storagePath = `uploads/${auth.currentUser.uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (uploadError) => {
        console.error('Upload failed:', uploadError);
        setError('Upload failed. Please check your connection and try again.');
        setIsUploading(false);
      },
      () => {
        // Upload completed successfully, now get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          setMessage('Upload complete! Creating processing job...');

          // Create a unique ID for our Firestore job document
          const jobId = uuidv4();
          const jobDocRef = doc(db, 'jobs', jobId);

          // Create the job document in Firestore
          await setDoc(jobDocRef, {
            jobId: jobId,
            userId: auth.currentUser?.uid,
            status: 'uploaded', // The initial status for our backend to find
            originalFileName: file.name,
            storagePath: storagePath,
            downloadURL: downloadURL,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp(),
          });

          setMessage('Your file is now in the queue for processing!');
          setIsUploading(false);
          setFile(null);
        }).catch(err => {
            console.error("Error creating job document:", err);
            setError("Upload succeeded, but failed to create processing job. Please contact support.");
            setIsUploading(false);
        });
      }
    );
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Song</h2>
      <p className="text-gray-400 mb-6">Upload an MP3 or WAV file to start the magic.</p>

      {/* Input Section */}
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 sm:p-12 text-center transition-colors hover:border-blue-400">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept="audio/*"
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`cursor-pointer font-semibold ${isUploading ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}>
          {file ? `Selected: ${file.name}` : 'Click here to select a file'}
        </label>
      </div>

      {/* Info/Error Messages */}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      {message && <p className="text-green-400 mt-4 text-center">{message}</p>}

      {/* Upload Button */}
      {file && !isUploading && (
        <button
          onClick={handleUpload}
          className="w-full mt-6 p-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-bold transition-transform transform hover:scale-105"
        >
          Start Processing
        </button>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-6">
          <p className="mb-2 text-center">Processing upload... {progress.toFixed(0)}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}