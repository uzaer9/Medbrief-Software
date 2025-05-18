// src/components/AudioUpload.js
import React, { useState } from 'react';
import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { transcribeAudio } from '../api/assemblyAI';
import { summarizeAndExtractPrescription } from '../api/gemini';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

function AudioUpload() {
  const { currentUser } = useAuth();
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudioUpload = async () => {
    if (!audioFile) return;
    try {
      setIsLoading(true);

      // Step 1: Upload audio file to Firebase Storage
      const storageRef = ref(storage, `audio/${audioFile.name}`);
      await uploadBytes(storageRef, audioFile);
      const audioUrl = await getDownloadURL(storageRef);

      // Step 2: Transcribe audio using AssemblyAI
      const { transcript } = await transcribeAudio(audioUrl);

      // Step 3: Summarize transcription and extract prescription using Google AI
      const { summary, medicines } = await summarizeAndExtractPrescription(transcript);

      // Step 4: Save conversation details to Firestore
      await addDoc(collection(firestore, 'appointments'), {
        doctor_id: currentUser.uid,
        patient_id: 'some_patient_id', // Link to actual patient in production
        audio_url: audioUrl,
        transcription: transcript,
        summary: summary,
        prescriptions: medicines,
        status: 'completed',
      });

      alert('Audio uploaded and processed successfully!');
    } catch (error) {
      console.error('Error during audio processing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setAudioFile(e.target.files[0])} />
      <button onClick={handleAudioUpload} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Upload Audio'}
      </button>
    </div>
  );
}

export default AudioUpload;
