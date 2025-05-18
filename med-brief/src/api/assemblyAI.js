// src/api/assemblyAI.js
import axios from 'axios';

export const transcribeAudio = async (audioUrl) => {
  try {
    // Send the audio URL to AssemblyAI for transcription
    const response = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      {
        audio_url: audioUrl,
      },
      {
        headers: { 'authorization': process.env.REACT_APP_ASSEMBLYAI_KEY },
      }
    );

    console.log('AssemblyAI initial response:', response.data); // Log full response

    // Check the transcription status and retrieve the text
    const transcriptId = response.data.id;
    let transcript = '';
    let status = 'processing';

    // Poll the API to get the transcript once processing is complete
    while (status === 'processing' || status === 'queued') {
      const transcriptResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { 'authorization': '8db5b577dc8d445eb9176535adb1393e' },
        }
      );

      status = transcriptResponse.data.status;
      console.log('Transcription status:', status); // Debug status

      if (status === 'failed') {
        throw new Error('Transcription failed.');
      }

      if (status === 'completed') {
        console.log('assembly response:', transcriptResponse);
        transcript = transcriptResponse.data.text;
       // Log the completed transcript
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }
   

    return {transcript};
  } catch (error) {
    console.error('Error during AssemblyAI transcription:', error);
    throw error; // Re-throw error to be caught in the upload handler
  }
};