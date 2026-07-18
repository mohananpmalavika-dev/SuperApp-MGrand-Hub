import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Slider, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Mic, MicOff, VolumeUp, VolumeOff, Settings } from '@mui/icons-material';
import './VoiceAvatar.css';

const SCENARIOS = [
  { id: 'room', label: 'Cozy Room' },
  { id: 'park', label: 'Park' },
  { id: 'beach', label: 'Beach' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'library', label: 'Library' },
  { id: 'classroom', label: 'Classroom' },
];

const VOICE_TYPES = [
  { id: 'female-soft', label: 'Gentle' },
  { id: 'male-calm', label: 'Warm' },
  { id: 'female-warm', label: 'Soft' },
  { id: 'male-energetic', label: 'Energetic' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'ml', label: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
];

/**
 * VoiceAvatar Component
 * Animated avatar with voice controls for the tutor
 */
function VoiceAvatar({
  avatarUrl,
  tutorName = 'AI Tutor',
  scenario = 'room',
  onVoiceInput,
  onSettingsChange,
  speaking = false,
  voiceEnabled = true,
}) {
  const [listening, setListening] = useState(false);
  const [voiceType, setVoiceType] = useState('female-soft');
  const [language, setLanguage] = useState('en');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [waveformActive, setWaveformActive] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = LANGUAGES.find(l => l.code === language)?.speechCode || 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setListening(false);
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Speech Synthesis
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language, onVoiceInput]);

  // Update waveform when speaking
  useEffect(() => {
    setWaveformActive(speaking);
  }, [speaking]);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled);
    if (synthRef.current && !audioEnabled) {
      synthRef.current.cancel();
    }
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES.find(l => l.code === newLang)?.speechCode || 'en-IN';
    }
    if (onSettingsChange) {
      onSettingsChange({ language: newLang });
    }
  };

  const handleVoiceTypeChange = (event) => {
    const newVoice = event.target.value;
    setVoiceType(newVoice);
    if (onSettingsChange) {
      onSettingsChange({ voiceType: newVoice });
    }
  };

  const handleSpeedChange = (event, newValue) => {
    setVoiceSpeed(newValue);
    if (onSettingsChange) {
      onSettingsChange({ voiceSpeed: newValue });
    }
  };

  return (
    <Box className="voice-avatar-container">
      {/* Video Stage with Scenario Background */}
      <Box className={`voice-avatar-stage scenario-${scenario}`}>
        <Box className="video-backdrop" />
        <Box className="live-badge">LIVE</Box>

        {/* Avatar */}
        <Box
          className={`avatar-image ${speaking ? 'speaking' : ''}`}
          style={{
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundColor: avatarUrl ? 'transparent' : '#667eea',
          }}
        >
          {!avatarUrl && (
            <Typography variant="h2" sx={{ color: 'white' }}>
              {tutorName.charAt(0)}
            </Typography>
          )}
          {/* Animated Mouth */}
          <Box className={`avatar-mouth ${speaking ? 'animated' : ''}`} />
        </Box>

        {/* Tutor Name Label */}
        <Box className="avatar-label">
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
            {tutorName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {SCENARIOS.find(s => s.id === scenario)?.label}
          </Typography>
        </Box>
      </Box>

      {/* Waveform Visualization */}
      <Box className={`voice-waveform ${waveformActive ? 'active' : ''}`}>
        <Box className="wave" />
        <Box className="wave" />
        <Box className="wave" />
        <Box className="wave" />
        <Box className="wave" />
      </Box>

      {/* Voice Controls */}
      <Box className="voice-controls">
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Microphone Control */}
          <IconButton
            onClick={handleVoiceToggle}
            disabled={!voiceEnabled}
            sx={{
              bgcolor: listening ? '#f44336' : '#4caf50',
              color: 'white',
              '&:hover': {
                bgcolor: listening ? '#d32f2f' : '#388e3c',
              },
              '&:disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            {listening ? <Mic /> : <MicOff />}
          </IconButton>

          {/* Audio Control */}
          <IconButton
            onClick={handleAudioToggle}
            sx={{
              bgcolor: audioEnabled ? '#2196f3' : '#9e9e9e',
              color: 'white',
              '&:hover': {
                bgcolor: audioEnabled ? '#1976d2' : '#757575',
              },
            }}
          >
            {audioEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>

          {/* Settings Toggle */}
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            sx={{
              bgcolor: '#673ab7',
              color: 'white',
              '&:hover': {
                bgcolor: '#5e35b1',
              },
            }}
          >
            <Settings />
          </IconButton>

          {/* Status Text */}
          <Typography variant="body2" sx={{ ml: 2, color: listening ? '#f44336' : '#666' }}>
            {listening ? '🎤 Listening...' : speaking ? '🔊 Speaking...' : '💬 Ready'}
          </Typography>
        </Box>

        {/* Settings Panel */}
        {showSettings && (
          <Box className="voice-settings-panel" sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Voice Settings
            </Typography>

            {/* Language Selection */}
            <FormControl fullWidth sx={{ mt: 2 }} size="small">
              <InputLabel>Language</InputLabel>
              <Select value={language} onChange={handleLanguageChange} label="Language">
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Voice Type Selection */}
            <FormControl fullWidth sx={{ mt: 2 }} size="small">
              <InputLabel>Voice Type</InputLabel>
              <Select value={voiceType} onChange={handleVoiceTypeChange} label="Voice Type">
                {VOICE_TYPES.map((voice) => (
                  <MenuItem key={voice.id} value={voice.id}>
                    {voice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Voice Speed Slider */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" gutterBottom>
                Voice Speed: {voiceSpeed.toFixed(1)}x
              </Typography>
              <Slider
                value={voiceSpeed}
                onChange={handleSpeedChange}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1x' },
                  { value: 2.0, label: '2x' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default VoiceAvatar;
