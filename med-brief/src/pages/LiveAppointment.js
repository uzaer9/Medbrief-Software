import React, { useState, useRef, useEffect } from 'react';
import { firestore, storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { transcribeAudio } from '../api/assemblyAI'; // AssemblyAI integration
import { summarizeAndExtractPrescription } from '../api/gemini'; // Gemini API integration

function LiveAppointment({ appointmentId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    setIsRecording(true);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.start();
      })
      .catch((err) => {
        console.error("Error accessing microphone: ", err);
        alert("Error accessing microphone!");
      });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `appointment_${appointmentId}.webm`, { type: 'audio/webm' });
      audioChunksRef.current = []; // Clear audio chunks after use

      // Upload the audio file
      await handleAudioUpload(audioFile);
    };
  };

  const handleAudioUpload = async (audioFile) => {
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `appointments/${appointmentId}/audio`);
      await uploadBytes(storageRef, audioFile);
      const uploadedAudioUrl = await getDownloadURL(storageRef);
      setAudioUrl(uploadedAudioUrl);

      // Transcribe the audio using AssemblyAI
      await processAudio(uploadedAudioUrl);
    } catch (error) {
      console.error("Error uploading audio: ", error);
    } finally {
      setIsUploading(false);
    }
  };

  const processAudio = async (audioUrl) => {
    try {
      setIsTranscribing(true);

      // Step 1: Transcribe audio using AssemblyAI
      const { transcript } = await transcribeAudio(audioUrl);

      // Step 2: Summarize transcription and extract prescription using Gemini API
      const { summary, medicines } = await summarizeAndExtractPrescription(transcript);

      // Step 3: Update Firestore with transcription, summary, and prescriptions
      const appointmentRef = doc(firestore, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        transcription: transcript,
        summary,
        prescriptions: medicines,
        status: 'completed',
      });

      alert('Live appointment processed and updated successfully!');
    } catch (error) {
      console.error("Error processing audio: ", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div>
      <h2>Appointment #{appointmentId}</h2>

      <button onClick={startRecording} disabled={isRecording}>
        {isRecording ? "Recording..." : "Start Appointment (Record Live Audio)"}
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => handleAudioUpload(e.target.files[0])}
        disabled={isUploading || isRecording}
      />
      <button disabled={isUploading || isRecording}>
        {isUploading ? "Uploading Audio..." : "Upload Audio (Post Appointment)"}
      </button>

      {isTranscribing && <p>Processing transcription and summary...</p>}
    </div>
  );
}

export default LiveAppointment;
